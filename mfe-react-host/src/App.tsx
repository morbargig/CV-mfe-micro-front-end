import { useEffect } from 'react';
import './App.css';
import { ShareData } from './services/shareClass.class';
import { FirebaseApi } from './services/firebaseApi.service';
import { take } from 'rxjs';


function App() {
  const initServices = () => {
    if (!(window as any).shareData) {
      (window as any).shareData = new ShareData();
    }
    if (!(window as any).firebaseApi) {
      (window as any).firebaseApi = new FirebaseApi();
      (window as any).firebaseApi.getPdf()?.pipe(take(1)).toPromise()
    }
  }
  useEffect(() => {
    initServices()
  }, [])
  initServices()

  return (
    <div className='host'>
      <div className="app-bg"></div>
      <div className="app-content">

        {/* @ts-ignore */}
        <app-mfe-ng-header></app-mfe-ng-header>
        {/* @ts-ignore */}
        <app-mfe-ng-menu  ></app-mfe-ng-menu>
        {/* @ts-ignore */}
        <app-mfe-ng-content></app-mfe-ng-content>
      </div>
    </div>
  );
}

export default App;
