import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { KeyringService } from 'src/app/services/keyring.service';
import { PreferenceService } from 'src/app/services/preference.service';
import { filter } from 'rxjs/operators';
import {
  FormControl,
  Validators,
  FormGroup,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { SeedType } from '../../enum/seed-type.enum';
import { SeedLanguage } from '../../enum/seed-language.enum';
import { AlertController } from '@ionic/angular';
import { from } from 'rxjs';

@Component({
  selector: 'app-seed-phrase',
  templateUrl: './seed-phrase.page.html',
  styleUrls: ['./seed-phrase.page.scss']
})
export class SeedPhrasePage {
  custom = false;
  import = false;
  existsVault = false;

  seedTypeControl = new FormControl(SeedType.Bip39, [Validators.required]);
  seedTypes: { typeString: string; typeValue: string }[] = [
    {
      typeString: this.keyringService.getSeedTypeName(SeedType.Bip39),
      typeValue: SeedType.Bip39
    },
    {
      typeString: this.keyringService.getSeedTypeName(SeedType.Electrum1),
      typeValue: SeedType.Electrum1
    }
  ];

  seedLanguageControl = new FormControl(SeedLanguage.ENGLISH, [
    Validators.required
  ]);
  languages = [
    SeedLanguage.CHINESE,
    SeedLanguage.ENGLISH,
    SeedLanguage.FRENCH,
    SeedLanguage.ITALIAN,
    SeedLanguage.JAPANESE,
    SeedLanguage.KOREAN,
    SeedLanguage.SPANISH
  ];

  seedPhraseControl = new FormControl('', [
    Validators.required,
    this.twelveWords
  ]);

  basePathControl = new FormControl("m/44'/22'/0'/0/", [Validators.required]);
  isBasePathReadonly = true;

  isSavedControl = new FormControl(false, [Validators.requiredTrue]);

  seedForm = new FormGroup({
    seedType: this.seedTypeControl,
    seedLanguage: this.seedLanguageControl,
    seedPhrase: this.seedPhraseControl,
    basePath: this.basePathControl,
    isSaved: this.isSavedControl
  });

  twelveWords(control: AbstractControl): ValidationErrors | null {
    const twelve =
      control.value.split(' ').length === 12 ||
      control.value.split('　').length === 12;
    const noVal = control.value === '';
    return noVal || twelve ? null : { twelveWords: true };
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private keyringService: KeyringService,
    private preferenceService: PreferenceService,
    private alertController: AlertController
  ) {}

  ionViewDidEnter(): void {
    this.activatedRoute.queryParams
      .pipe(filter(params => params.custom || params.import))
      .subscribe({
        next: params => {
          if (params.custom === 'true') {
            this.custom = params.custom;
            this.generateRandomMnemonic();
          } else if (params.import === 'true') {
            this.import = params.import;
          }
        }
      });

    this.keyringService.existsVault().subscribe({
      next: exists => {
        this.existsVault = exists;
        if (exists) {
          const hdKey = this.keyringService.getHdkey();
          this.seedTypeControl.setValue(hdKey.seedType);
          this.seedPhraseControl.setValue(hdKey.mnemonic);
          this.basePathControl.setValue(hdKey.basePath);
          this.seedTypeControl.disable();
        }
      }
    });
  }

  generateRandomMnemonic(): void {
    this.seedPhraseControl.setValue(
      this.keyringService.generateRandomMnemonic(
        this.seedTypeControl.value,
        this.seedLanguageControl.value
      )
    );
  }

  changeType(): void {
    switch (this.seedTypeControl.value) {
      case SeedType.Bip39:
        this.basePathControl.setValue("m/44'/22'/0'/0/");
        break;
      case SeedType.Electrum1:
        this.basePathControl.setValue("m/0'/0/");
        break;
    }
    if (this.custom) {
      this.generateRandomMnemonic();
    }
  }

  changeLang(): void {
    if (this.custom) {
      this.generateRandomMnemonic();
    }
  }

  requestChagne(): void {
    if (!this.existsVault) {
      const buttons: any[] = [
        { text: 'CANCEL', role: 'cancel' },
        {
          text: 'CHANGE',
          handler: (): void => {
            this.isBasePathReadonly = false;
          }
        }
      ];
      from(
        this.alertController.create({
          header: 'WARNING',
          message: 'Do not change without understanding.',
          buttons: buttons
        })
      ).subscribe({ next: alert => alert.present() });
    }
  }

  finishBackup(): void {
    if (!this.existsVault) {
      this.keyringService.createCustomKeyring(
        this.seedTypeControl.value,
        this.seedPhraseControl.value,
        this.basePathControl.value
      );
    }
    this.preferenceService.finishBackup();
    this.router.navigateByUrl('/');
  }

  cancel(): void {
    this.location.back();
  }
}
