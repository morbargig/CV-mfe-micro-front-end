import firebase from 'firebase';
import { from, map, Observable, switchMap, tap, take, catchError, EMPTY, ReplaySubject } from 'rxjs';
type pdfData = { [key: string]: string }

type pdfModel<T extends pdfData = pdfData> = { data: T } & {
    language: keyof T,
}
export class FirebaseApi {
    private _firebase?: firebase.app.App

    private get firebase(): firebase.app.App {
        return this._firebase || firebase.app()
    }

    private auth?: firebase.auth.Auth

    initAuth = () => this.auth = this.firebase.auth()

    logout = (): Observable<void> => !!this.user ? from(this.auth?.signOut() || EMPTY)?.pipe(tap(() => { this.user = null })) : EMPTY

    login = () => from(this.auth?.signInWithPopup(new firebase.auth.GoogleAuthProvider()) || EMPTY)?.pipe(
        catchError(err => { console.error(err); return EMPTY }),
        tap(({ user }) => (this.user = user))
    )

    private get username(): string {
        return (
            // this.user?.uid ||
            this.adminUserName
        )
    }
    private user?: firebase.User | null
    private adminUserName: string = 'Hyr14QJ2wHPrMPsurzVP5yumse12'
    public pdf?: pdfModel
    public pdfChanged: ReplaySubject<pdfModel> = new ReplaySubject<pdfModel>(1)
    public authStateChanged: ReplaySubject<FirebaseApi['user']> = new ReplaySubject<FirebaseApi['user']>(1)

    constructor() {
        let firebaseConfig: any = {}
        try {
            firebaseConfig = require('../config/firebaseConfig/firebaseConfig.json')
        } catch (e) { }
        finally {
            !firebase.apps.length &&
                (this._firebase = firebase.initializeApp({
                    apiKey: process.env.API_KEY || firebaseConfig.apiKey,
                    authDomain: process.env.AUTH_DOMAIN || firebaseConfig.authDomain,
                    databaseURL: process.env.DATABASE_URL || firebaseConfig.databaseURL,
                    projectId: process.env.PROJECT_ID || firebaseConfig.projectId,
                    storageBucket: process.env.STORAGE_BUCKET || firebaseConfig.storageBucket,
                    messagingSenderId: process.env.MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
                    appId: process.env.APP_ID || firebaseConfig.appId
                }));
            this.initAuth()
            this.onAuthStateChanged((u) => { this.user = u; this.authStateChanged?.next(u) })
        }
    }

    public get keys(): (keyof pdfModel['data'])[] {
        const keys = Object.keys(this.pdf?.data || {})
        if (Object.keys(this.pdf || {})?.length) {
            return keys as (keyof pdfModel['data'])[]
        }
        return []
    }

    private onAuthStateChanged = (nextOrObserver: | firebase.Observer<any> | ((a: firebase.User | null) => any),
        error?: (a: firebase.auth.Error) => any,
        completed?: firebase.Unsubscribe) => this.auth?.onAuthStateChanged(nextOrObserver, error, completed)

    newPdf = (): Observable<pdfModel> =>
        from(this.firebase.database().ref(`CV/${this.username}/`).set({
            language: 'englishFile', data: {
                englishFile: '',
                hebrewFile: '',
                linkedinFileFile: '',
            }
        } as pdfModel))

    updatePdfState = (pdf: pdfModel) => {
        const handleChanges = (pdf: pdfModel) => {
            this.pdf = pdf;
            this.pdfChanged.next(pdf);
        }
        if (!pdf) {
            const s = this.newPdf()?.pipe(take(1))?.subscribe((pdf) => {
                s?.unsubscribe()
                handleChanges(pdf)
            })
        } else {
            handleChanges(pdf)
        }
    }

    getPdf = (): Observable<pdfModel> =>
        from(this.firebase.database().ref(`CV/${this.username}/`).once('value'))?.pipe(map(snap => snap?.val()), tap(this.updatePdfState))

    uploadPdf = (uploadedImage: (Blob | Uint8Array | ArrayBuffer), fileName: string, fileTypeName: keyof pdfModel['data'] = this.pdf?.language || ''): Observable<string> => {
        const storageRef = this.firebase.storage().ref();
        const fileRef = storageRef
            .child(`/CV/${this.username}/${fileName}`);
        return from(fileRef.put(uploadedImage))?.pipe(
            tap((x) => {
                console.log(x)
                debugger
            }),
            switchMap(uploadTaskSnapshot => from(uploadTaskSnapshot.ref.getDownloadURL())
            ))?.pipe(
                tap(x => {
                    console.log(x)
                    debugger
                }),
                tap(url => this.updatePdf(
                    {
                        ...this.pdf,
                        data: {
                            ...this.pdf?.data,
                            [fileTypeName]: url
                        },
                        language: fileTypeName
                    }).toPromise()),
            )
    }

    updatePdf = (upData: pdfModel): Observable<any> => {
        return from(this.firebase.database().ref(`CV/${this.username}/`).once('value')).pipe(
            tap(x => {
                console.log(x)
                debugger
            }),
            switchMap(snap =>
                from(this.firebase.database().ref(`CV/${this.username}`).set({ ...snap.val(), ...upData, data: { ...snap.val()?.data, ...upData?.data } } as pdfModel))?.pipe(
                    tap(x => {
                        console.log(x)
                        debugger
                    }),
                    tap(() => this.updatePdfState({ ...snap.val(), ...upData, data: { ...snap.val()?.data, ...upData?.data } } as pdfModel))
                ))
        )
    }

    deleteFile = (url: string) => from(this.firebase.storage().refFromURL(url)?.delete())

    deletePdf = (deletePdfKey: keyof pdfModel['data']): any => {
        const { pdf: pdfSnapshot } = this
        if (!!deletePdfKey && !!pdfSnapshot?.data?.[deletePdfKey]) {
            this.deleteFile(pdfSnapshot?.data?.[deletePdfKey] || '')
            delete pdfSnapshot?.data?.[deletePdfKey]
            pdfSnapshot.language = Object?.keys(pdfSnapshot?.data || {})?.[0] as keyof pdfModel['data']
            return from(this.firebase.database().ref(`CV/${this.username}`).set(pdfSnapshot as pdfModel))?.pipe(
                tap(() => this.pdf = pdfSnapshot)
            )
        }
    }
}