import { Component, EventEmitter } from '@angular/core';
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
export class AppComponent {
  constructor(private translate: TranslateService) {
    translate.setDefaultLang('en');
    translate.use('en');
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
      "window.firebaseApi: ", this.firebaseApi,

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
    ).subscribe(({ language }: Pdf) => {
      console.log('language:', language)
      this.shareData?.defaultLan.next(language ? languageTypeEnum[language] : this.translate.defaultLang)
    })
  }
  buttonsText: { name: keyof typeof languageTypeEnum }[] = [
    { name: 'englishFile' },
    { name: 'hebrewFile' },
    { name: 'linkedinFile' }
  ]
  public get pdf(): Pdf {
    return this.firebaseApi?.pdf
  }
  getPDF({ name }: { name: keyof typeof languageTypeEnum }) {
    this.firebaseApi.updatePdf({ language: name })?.toPromise();
  }
}
