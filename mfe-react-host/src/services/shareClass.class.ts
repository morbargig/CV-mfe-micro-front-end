import { BehaviorSubject } from 'rxjs'

export class ShareData {
    public isMobileDevice: boolean = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    public isPortraitMode?: boolean = this.checkIsPortraitMode()
    private checkIsPortraitMode(): boolean {
        return window.matchMedia("(orientation: portrait)").matches
    }
    public defaultLan: BehaviorSubject<string> = new BehaviorSubject('en');
}