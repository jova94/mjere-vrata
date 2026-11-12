# Vrata Milos Mahagoni – uputstvo

iOS aplikacija (React Native / Expo SDK 58) za unos mjera vrata po projektima, automatski obračun cijene i export u Excel.

## Šta aplikacija radi

- **Projekti** – lista kao kartice (broj, klijent, telefon, email, datum, ukupna cijena, broj vrata, m², obim), pretraga, export svih projekata u jedan Excel.
- **Projekat** – podaci o klijentu, bilješka, lista vrata, ukupno, export projekta u Excel (dijeli se preko iOS share menija: Mail, WhatsApp, Files...).
- **Vrata** – oznaka/prostorija, širina × visina (cm), komada, boja, linije, bilješka, opcionalno ručna cijena. Cijena se računa uživo.
- **Podešavanja** – cjenovnik: standardne mjere sa cijenom, boje i linije sa doplatom (fiksni iznos ili %), tolerancija, cijena po m², valuta, numeracija projekata.

### Kako se računa cijena

1. Pronađe se standardna mjera najbliža unesenoj (gleda se veće odstupanje od širine i visine).
2. Ako je odstupanje ≤ **tolerancije** (podrazumijevano 5 cm) → osnovna cijena = cijena te mjere.
   Inače, ako je postavljena **cijena po m²** → osnovna = površina × cijena po m². Inače vrata su označena „Nema cijene”.
3. Dodaje se doplata za **boju** i za **linije** (fiksno ili % od osnovne).
4. Ukupno = cijena po komadu × broj komada. Ručna cijena (prekidač u formi vrata) zamjenjuje izračun.

Podaci se čuvaju lokalno na telefonu (SQLite).

## Besplatno: web aplikacija (PWA) na iPhone-u

**Objavljeno na: https://vrata-milos-mahagoni.expo.app** (Expo nalog `djole994`, besplatni EAS Hosting).

Ne treba Apple nalog ni Mac. Treba samo besplatan Expo nalog (https://expo.dev/signup).

1. Iz foldera `mjere-vrata` prijavi se jednom:
   ```
   npx eas-cli@latest login
   ```
2. Napravi i objavi web verziju:
   ```
   npm run deploy:web
   ```
   Prvi put će pitati da poveže projekat i da izabereš ime poddomena (npr. `vrata-milos`).
   Dobićeš adresu oblika `https://vrata-milos.expo.app`.
3. Na iPhone-u otvori tu adresu u **Safariju** → dugme **Dijeli** (kvadrat sa strelicom) → **Dodaj na početni ekran**.
   Dobićeš Mahagoni ikonicu; aplikacija se otvara preko cijelog ekrana.

Za svaku izmjenu ponovi korak 2; aplikacija na telefonu se sama osvježi pri sljedećem otvaranju.

**Važno o podacima u PWA verziji:** projekti se čuvaju samo na tom telefonu, u memoriji web aplikacije.
Ako obrišeš aplikaciju sa početnog ekrana ili podatke Safarija, projekti se brišu. Povremeno napravi Excel izvoz kao rezervnu kopiju.
Excel izvoz na iPhone-u otvara meni za dijeljenje (Mail, WhatsApp, Files...).

Lokalno probanje web verzije: `npm run build:web`, pa `npx serve -s dist`.

## Šta ti treba (za TestFlight, plaćeno)

- **Apple Developer Program** nalog (99 USD/godišnje) – obavezno za TestFlight. https://developer.apple.com/programs/
- Besplatan **Expo** nalog – https://expo.dev/signup
- Mac **nije** potreban: build radi EAS u cloudu.

## Objavljivanje na TestFlight (iz ovog foldera, Windows PowerShell)

1. Prijava na Expo:
   ```
   npx eas-cli@latest login
   ```
2. Poveži projekat sa Expo nalogom (jednom):
   ```
   npx eas-cli@latest init
   ```
3. Bundle ID u `app.json` je `com.mahagoni.mjerevrata`. Mora biti jedinstven na App Store-u; nakon prvog builda se više ne mijenja.
4. Napravi iOS build i odmah ga pošalji na App Store Connect / TestFlight:
   ```
   npx eas-cli@latest build --platform ios --profile production --auto-submit
   ```
   EAS će te pitati za Apple ID login i sam napraviti sertifikate, provisioning profile i aplikaciju u App Store Connect-u (odgovori „Yes” na pitanja).
5. Kad build završi (~15–25 min) i Apple ga obradi (još ~10–30 min), otvori **App Store Connect → Apps → Vrata Milos Mahagoni → TestFlight**, i dodaj sebe u **Internal Testing** grupu.
6. Na iPhone instaliraj aplikaciju **TestFlight** iz App Store-a, prihvati pozivnicu iz emaila i instaliraj „Vrata Milos Mahagoni”.

Sljedeće verzije: ponovi korak 4 (broj builda se povećava automatski).

## Razvoj / probanje na računaru

```
npm install
npx expo start
```
Aplikacija koristi samo module iz Expo SDK, pa se može otvoriti i u **Expo Go** aplikaciji na iPhone-u skeniranjem QR koda (ako Expo Go podržava SDK 58).

Provjere:
```
npx tsc --noEmit
npx expo-doctor
```

## Logo i ikonica

- `assets/icon.png` – ikonica aplikacije (1024×1024, Mahagoni logo na bijeloj pozadini)
- `assets/logo.png` – logo prikazan na vrhu liste projekata

## Struktura

- `src/app/` – ekrani (Expo Router): `index` (projekti), `project/[id]`, `project-form`, `door-form`, `settings`
- `src/lib/pricing.ts` – obračun cijene
- `src/lib/excel.ts` – Excel export (SheetJS)
- `src/lib/store.tsx` – stanje i čuvanje podataka
- `src/lib/defaults.ts` – početni cjenovnik (primjer, mijenja se u Podešavanjima)
