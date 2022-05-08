import { Component, OnInit, EventEmitter, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged, takeUntil } from 'rxjs';
type Pdf = { data: { [key in keyof typeof languageTypeEnum]+?: string } } & {
  language?: keyof Pdf['data'],
}
enum languageTypeEnum {
  englishFile = 'en',
  linkedinFile = 'en',
  hebrewFile = 'he'
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private translate: TranslateService,
    private zone: NgZone
  ) {
    translate.setDefaultLang('en');
    translate.use(translate.defaultLang);
  }
  private get shareData() {
    return (window as any)?.shareData
  }
  private get firebaseApi() {
    return (window as any)?.firebaseApi
  }
  ended: EventEmitter<void> = new EventEmitter<void>()
  ngOnDestroy(): void {
    this.ended.next()
    this.ended.complete()
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
  }
  ngOnInit(): void {
    console.log(
      "window.shareData: ", this.shareData,
    )
    const defaultLan = this.shareData?.defaultLan?.getValue()
    if (!!defaultLan) {
      this.translate.use(defaultLan);
    }
    this.shareData?.defaultLan.pipe(
      takeUntil(this.ended),
      distinctUntilChanged()
    ).subscribe((l: string) => {
      !!l && this.translate.use(l);
    })
    this.firebaseApi?.pdfChanged?.pipe(
      takeUntil(this.ended),
      distinctUntilChanged()
    ).subscribe((pdf: Pdf) => {
      this.url = pdf?.data[pdf?.language || 'englishFile']
    })
  }
  openMenu: boolean = false
  url?: string = "https://firebasestorage.googleapis.com/v0/b/morbargig-a81d2.appspot.com/o/CV%2Fno-photo-available.png?alt=media&token=27b382af-7a35-4551-ade9-5edb5271df6b"
  public get isAdmin(): boolean {
    return this?.user?.email === 'morbargig@gmail.com'
  }
  private get user() {
    return this.firebaseApi.user
  }
  adminLogin = () => this.firebaseApi.login()
  logout = (): Promise<void> => this.firebaseApi.logout()
  private get pdf(): Pdf {
    return this.firebaseApi.pdf
  }

  handleImage = (e: Event) => {
    const file: File = ((e?.target as any)?.files as File[])?.[0];
    if (!!file) {
      this.zone.runOutsideAngular(() => {
        this.firebaseApi.uploadPdf(file, file.name, this.pdf.language)?.toPromise()
      })
    }
  }
}
