import { ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeHtml } from '@angular/platform-browser';
import { takeUntil, distinctUntilChanged, startWith } from 'rxjs';

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
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'mfe-ng-content';
  public get isMobileDevice(): boolean {
    return this.shareData?.isMobileDevice
  }
  private get shareData() {
    return (window as any)?.shareData
  }
  private get firebaseApi() {
    return (window as any)?.firebaseApi
  }
  public defaultUrl: string = 'https://firebasestorage.googleapis.com/v0/b/morbargig-a81d2.appspot.com/o/CV%2Fno-photo-available.png?alt=media&token=27b382af-7a35-4551-ade9-5edb5271df6b'
  public url?: SafeResourceUrl
  public html?: SafeHtml
  constructor(
    private sanitizer: DomSanitizer,
    private cd: ChangeDetectorRef
  ) { }
  ended: EventEmitter<void> = new EventEmitter<void>()
  ngOnDestroy(): void {
    this.ended.next()
    this.ended.complete()
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
  }
  log(any: any) {
    console.log(any)
  }

  ngOnInit() {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.defaultUrl)
    this.firebaseApi?.pdfChanged?.pipe(
      takeUntil(this.ended),
      distinctUntilChanged()
    ).subscribe((pdf: Pdf) => {
      // this.url = undefined
      const language = pdf?.language
      const url = !!language ? (pdf?.data[language] || this.defaultUrl) : this.defaultUrl;
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      // console.log(
      //   '\npdf: ', pdf,
      //   '\nlanguage: ', language,
      //   '\nurl: ', url,
      //   '\nthis.url:', this.url,
      // )
      this.cd.checkNoChanges()

    })
  }
}
