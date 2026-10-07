# 🌾 Karthik Flour Mill – Billing & Inventory App

A mobile-first **billing and inventory management app** built for **Karthik Flour Mill**. It runs as a hybrid Android app (React + Capacitor), works fully **offline**, and can print or share bills straight from your phone.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-Android-119EFF?logo=capacitor&logoColor=white)
![Offline](https://img.shields.io/badge/Offline-First-success)

---

## ✨ Features

### 📦 Product & Inventory Management
- Pre-configured product categories:
  - **Flour** – Wheat, Maida, Gram, Ragi
  - **Rava** – Bombay Sooji, Upma Rava
  - **Packing** – Carry bags, Packing covers
- Tracks stock levels for every item

### 🧾 Billing / Point of Sale
- Create bills quickly for customers
- Native-feel **swipe-to-delete** for removing items from the cart

### 🖨️ Printing, Sharing & Saving
- **Print receipts** directly from the device using `@capgo/capacitor-printer`
- **Share bills** (e.g. via WhatsApp) or **save them to the device** – the bill is captured as an image with `html2canvas` and handled through Capacitor's `Share` and `Filesystem` plugins

### 👥 Customer Management
- Store customer details locally for faster repeat billing

### 📴 Offline First
- No backend or internet connection required
- All data (session, products, customers, inventory, past bills) is saved on-device in `localStorage`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 |
| Build tool | Vite |
| Mobile wrapper | Capacitor (`@capacitor/android`) |
| Styling | Custom CSS (`index.css`, `App.css`) |
| Icons | `lucide-react` |
| Storage | Browser `localStorage` |
| Printing | `@capgo/capacitor-printer` |
| Bill export | `html2canvas`, Capacitor `Share` + `Filesystem` |

---

## 📲 Download & Install the App (APK)

[![Download APK](https://img.shields.io/badge/Download-Latest%20APK-brightgreen?style=for-the-badge&logo=android)](https://github.com/Karthikprabhu07/billing-app/releases/latest)

### Where to download
The APK is **not** inside the code files. Download it from the **Releases** section of this repository:

1. Open the [**Releases page**](https://github.com/Karthikprabhu07/billing-app/releases/latest), or click **Releases** in the right-hand sidebar of this repo's main page.
2. Under the latest release, scroll to the **Assets** section.
3. Tap **`Karthik.Co.apk`** to download it.

### How to install
1. If you downloaded the file on a computer, copy it to your Android phone.
2. Open `Karthik.Co.apk` and tap **Install**.
   - If prompted, allow **"Install unknown apps"** for your browser or file manager.
   - If Google Play Protect shows a warning, tap **More details → Install anyway**.
3. Launch the app from your app drawer.

> **Note:** Since all data is stored locally on the device, clearing the app's storage or uninstalling it will erase your products, customers, and bill history.

---

## 🚀 Getting Started (Development)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Android Studio](https://developer.android.com/studio) (for building the Android app)

### Setup

```bash
# Clone the repository
git clone https://github.com/Karthikprabhu07/billing-app.git
cd billing-app

# Install dependencies
npm install

# Start the dev server (runs in the browser)
npm run dev
```

### Build & Run on Android

```bash
# Build the web app
npm run build

# Sync the build into the Android project
npx cap sync android

# Open the project in Android Studio
npx cap open android
```

From Android Studio, run the app on an emulator or a connected device, or use **Build → Build Bundle(s) / APK(s) → Build APK(s)** to generate an installable APK.

---

## 🔮 Possible Future Improvements

- Cloud backup / export of data (CSV or Excel)
- Sales reports and low-stock alerts
- Multi-device sync
- GST-ready invoice formats

---

## 🤝 Contributing

Suggestions and pull requests are welcome. Feel free to open an issue to discuss what you'd like to change.

## 📄 License

Add a license of your choice (e.g. MIT) in a `LICENSE` file.

---

Made with ❤️ by [Karthikprabhu07](https://github.com/Karthikprabhu07)
