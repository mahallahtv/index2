// File: offline-license-system-unified-complete.js
// SISTEM LISENSI OFFLINE UNIFIED - Versi ES5 untuk STB Indihome
// DENGAN FUNGSI UPGRADE LENGKAP - COMPLETE VERSION

//CONSTRUCTOR
var OfflineLicenseSystem = function() {

    // Kode lisensi valid (bisa diubah oleh admin)
    this.validLicenseKeys = {
        'RH-MTV-1Q2W3E': { // Trial
            package: 'trial',
            expiryDays: 2,
            created: '2024-01-01'
        },
        'RH-MTV-4R5T6Y': { // Dasar
            package: 'basic', 
            expiryDays: 365,
            created: '2024-01-01'
        },
        'RH-MTV-7U8I9O': { // Premium
            package: 'premium',
            expiryDays: 365,
            created: '2024-01-01'
        },
        'RH-MTV-0PASD1': { // VIP
            package: 'vip',
            expiryDays: 9999,
            created: '2024-01-01'
        },
        'RH-MTV-VIP001': { // Kode khusus untuk user DEV-MJAH2YDI-GWZ450
            package: 'vip',
            expiryDays: 9999,
            created: '2025-12-18'
        },
        'RH-MTV-BAS001': { // Kode contoh untuk paket dasar
            package: 'basic',
            expiryDays: 365,
            created: '2025-12-18'
        },
        'RH-MTV-PRE001': { // Kode contoh untuk paket premium
            package: 'premium',
            expiryDays: 365,
            created: '2025-12-18'
        }
    };

    // Load validLicenseKeys dari localStorage (jika ada)
    this.loadValidLicenseKeys();
    
    // Data paket dengan fitur
    this.licensePackages = {
        'trial': {
            name: 'Uji Coba',
            price: 50000,
            features: {
                hiddenLogo: true,
                hiddenSlides: [2, 3, 4],
                hiddenPowerButton: true,
                hiddenVillageName: true,
                maxImages: 2,
                hiddenImsakSyuruq: true,  // INI AKAN HIDE BOTH IMSAK & SYURUQ
                maghribIsyaActiveMinutes: 15,
                hiddenSettingsButtons: ['data-masjid', 'running-text', 'slider-duration'],
                hiddenAdzanButtons: ['countdown-adzan', 'countdown-iqamah', 'overlay-duration'],
                hiddenAudio: ['shalawat', 'adzan'],
                ads: {
                    enabled: true,
                    duration: 15,
                    interval: 10,
                    overlayBehavior: 'behind'
                }
            }
        },
        'basic': {
            name: 'Dasar',
            price: 340000,
            features: {
                hiddenLogo: true,
                hiddenSlides: [2, 4],
                hiddenPowerButton: false,
                hiddenVillageName: false,
                maxImages: 2,
                hiddenImsakSyuruq: false,
                maghribIsyaActiveMinutes: 0,
                hiddenSettingsButtons: ['slider-duration'],
                hiddenAdzanButtons: ['overlay-duration'],
                hiddenAudio: ['shalawat', 'adzan'],
                ads: {
                    enabled: true,
                    duration: 5,
                    interval: 300,
                    overlayBehavior: 'behind'
                }
            }
        },
        'premium': {
            name: 'Premium',
            price: 570000,
            features: {
                hiddenLogo: false,
                hiddenSlides: [],
                hiddenPowerButton: false,
                hiddenVillageName: false,
                maxImages: 5,
                hiddenImsakSyuruq: false,
                maghribIsyaActiveMinutes: 0,
                hiddenSettingsButtons: [],
                hiddenAdzanButtons: [],
                hiddenAudio: [],
                ads: { enabled: false }
            }
        },
        'vip': {
            name: 'VIP',
            price: 1420000,
            features: {
                hiddenLogo: false,
                hiddenSlides: [],
                hiddenPowerButton: false,
                hiddenVillageName: false,
                maxImages: 7,
                hiddenImsakSyuruq: false,
                maghribIsyaActiveMinutes: 0,
                hiddenSettingsButtons: [],
                hiddenAdzanButtons: [],
                hiddenAudio: [],
                ads: { enabled: false }
            }
        }
    };
    
    this.currentLicense = null;
    this.deviceId = this.getDeviceId();
    this.adsTimer = null;
    this.isShowingAds = false;
    this.demoUsedKey = 'demo_used_' + this.deviceId;

    
    // GANTI URL DATABASE dengan yang benar:
    // GANTI dengan config yang sesuai struktur data Anda
    this.firebaseConfig = {
        apiKey: "AIzaSyBQpRmeu0BXMwUbOiBM1PJQbpf50Z8a5aQ",
        authDomain: "adzan-app-license.firebaseapp.com",
        databaseURL: "https://adzan-app-license-default-rtdb.asia-southeast1.firebasedatabase.app/",
        projectId: "adzan-app-license",
        storageBucket: "adzan-app-license.firebasestorage.app",
        messagingSenderId: "415826888654",
        appId: "1:415826888654:web:0145336292304240c9cd9f"
    };
    this.firebaseApp = null;
    this.database = null;
    this.isFirebaseInitialized = false;


    
    // Default gambar iklan
    this.adImages = [
        'ads/ad1.jpg',
        'ads/ad2.jpg',
        'ads/ad3.jpg'
    ];
};

// ==================== FUNGSI FIREBASE ====================
// Fungsi untuk cek Firebase SDK
function checkFirebaseLoaded() {
    console.log('=== CHECKING FIREBASE ===');
    console.log('window.firebase:', typeof window.firebase);
    console.log('firebase.database:', window.firebase ? typeof window.firebase.database : 'undefined');
    console.log('firebase.apps:', window.firebase ? window.firebase.apps : 'undefined');
    
    if (typeof firebase === 'undefined') {
        console.error('ERROR: Firebase SDK not loaded!');
        alert('Firebase SDK tidak ditemukan. Pastikan script Firebase v8 sudah ditambahkan di HTML.');
        return false;
    }
    
    return true;
}

OfflineLicenseSystem.prototype.initializeFirebase = function() {
    try {
        // Cek Firebase SDK
        if (!checkFirebaseLoaded()) {
            return false;
        }
        
        // Cek jika sudah diinisialisasi
        if (this.isFirebaseInitialized && this.database) {
            console.log('Firebase already initialized');
            return true;
        }
        
        console.log('Initializing Firebase...');
        
        // Initialize Firebase
        if (!firebase.apps || firebase.apps.length === 0) {
            this.firebaseApp = firebase.initializeApp(this.firebaseConfig);
            console.log('New Firebase app initialized');
        } else {
            this.firebaseApp = firebase.app();
            console.log('Using existing Firebase app');
        }
        
        // Get database reference
        this.database = firebase.database();
        this.isFirebaseInitialized = true;
        
        console.log('Firebase initialized successfully');
        console.log('Database URL:', this.firebaseConfig.databaseURL);
        
        return true;
        
    } catch (error) {
        console.error('ERROR initializing Firebase:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        
        // Tampilkan error detail
        var errorMsg = 'Firebase Error: ' + (error.message || error);
        this.showToast(errorMsg, 'error');
        
        return false;
    }
};

OfflineLicenseSystem.prototype.saveLicenseToFirebase = function(licenseData) {
    if (!this.initializeFirebase()) return false;
    
    try {
        var licenseRef = this.database.ref('licenses/' + licenseData.key);
        licenseRef.set(licenseData);
        console.log('License saved to Firebase:', licenseData.key);
        return true;
    } catch (error) {
        console.error('Error saving to Firebase:', error);
        return false;
    }
};

OfflineLicenseSystem.prototype.validateLicenseWithFirebase = function(licenseKey, callback) {
    if (!this.initializeFirebase()) {
        if (callback) callback(null);
        return;
    }
    
    try {
        var licenseRef = this.database.ref('licenses/' + licenseKey);
        licenseRef.once('value', function(snapshot) {
            var data = snapshot.val();
            if (callback) callback(data);
        });
    } catch (error) {
        console.error('Error validating with Firebase:', error);
        if (callback) callback(null);
    }
};

OfflineLicenseSystem.prototype.updateLicenseInFirebase = function(licenseKey, updates) {
    if (!this.initializeFirebase()) return false;
    
    try {
        var licenseRef = this.database.ref('licenses/' + licenseKey);
        licenseRef.update(updates);
        console.log('License updated in Firebase:', licenseKey);
        return true;
    } catch (error) {
        console.error('Error updating in Firebase:', error);
        return false;
    }
};

OfflineLicenseSystem.prototype.getAllLicensesFromFirebase = function(callback) {
    if (!this.initializeFirebase()) {
        if (callback) callback(null, 'Firebase not initialized');
        return;
    }
    
    try {
        console.log('Fetching licenses from Firebase...');
        var licensesRef = this.database.ref('licenses');
        
        licensesRef.once('value', function(snapshot) {
            console.log('Firebase snapshot received');
            
            if (!snapshot.exists()) {
                console.log('No data in Firebase');
                if (callback) callback(null, 'No data in Firebase');
                return;
            }
            
            var data = snapshot.val();
            console.log('Firebase data keys:', Object.keys(data));
            
            // Tampilkan contoh data pertama untuk debug
            var firstKey = Object.keys(data)[0];
            console.log('Sample data (first item):', data[firstKey]);
            
            if (callback) callback(data, null);
            
        }, function(error) {
            console.error('Firebase error:', error);
            console.error('Error code:', error.code);
            if (callback) callback(null, error.message);
        });
        
    } catch (error) {
        console.error('Exception in getAllLicensesFromFirebase:', error);
        if (callback) callback(null, error.message);
    }
};

OfflineLicenseSystem.prototype.generateLicenseOnFirebase = function(licenseData) {
    console.log('Generating license for:', licenseData);
    
    // 1. Generate kode unik
    var licenseCode = 'RH-MTV-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // 2. Tentukan expiry days berdasarkan paket
    var expiryDays = 365;
    var price = this.licensePackages[licenseData.package].price;
    
    if (licenseData.package === 'vip') {
        expiryDays = 9999;
    } else if (licenseData.package === 'trial') {
        expiryDays = 2;
    }
    
    // 3. Hitung expiry date
    var expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    
    // 4. Data lengkap untuk localStorage
    var localData = {
        code: licenseCode,
        package: licenseData.package,
        customerName: licenseData.customerName || 'Anonymous',
        deviceId: licenseData.deviceId || this.deviceId,
        status: 'pending',
        generatedAt: new Date().toISOString(),
        created: new Date().toISOString().split('T')[0],
        expiryDays: expiryDays,
        price: price,
        expiryDate: expiryDate.toISOString()
    };
    
    // 5. SIMPAN KE LOCALSTORAGE DULU
    var generatedLicenses = JSON.parse(localStorage.getItem('generated_licenses') || '[]');
    generatedLicenses.push(localData);
    localStorage.setItem('generated_licenses', JSON.stringify(generatedLicenses));
    
    console.log('Saved to localStorage:', localData);
    
    // 6. Tambahkan ke validLicenseKeys lokal
    this.validLicenseKeys[licenseCode] = {
        package: licenseData.package,
        expiryDays: expiryDays,
        created: localData.created,
        price: price
    };
    this.saveValidLicenseKeys();
    
    // 7. Data untuk Firebase (sesuai struktur Anda)
    var firebaseData = {
        licenseKey: licenseCode,           // Nama field sesuai struktur Anda
        package: licenseData.package,
        customerName: licenseData.customerName || 'Anonymous',
        deviceId: licenseData.deviceId || this.deviceId,
        status: 'pending',
        generatedAt: new Date().toISOString(),
        createdDate: new Date().toISOString().split('T')[0],
        expiryDate: expiryDate.toISOString(),
        lastUpdated: new Date().toISOString(),
        price: price,
        expiryDays: expiryDays
    };
    
    // 8. Coba simpan ke Firebase (background)
    this.saveToFirebase(licenseCode, firebaseData);
    
    return licenseCode;
};

OfflineLicenseSystem.prototype.saveToFirebase = function(licenseCode, data) {
    if (!this.initializeFirebase()) {
        console.warn('Firebase not available, saving locally only');
        return false;
    }
    
    try {
        console.log('Saving to Firebase:', licenseCode, data);
        
        var licenseRef = this.database.ref('licenses/' + licenseCode);
        licenseRef.set(data, function(error) {
            if (error) {
                console.error('Firebase save error:', error);
                // Simpan ke queue untuk retry
                var failedQueue = JSON.parse(localStorage.getItem('firebase_failed_queue') || '[]');
                failedQueue.push({
                    code: licenseCode,
                    data: data,
                    timestamp: Date.now(),
                    error: error.message
                });
                localStorage.setItem('firebase_failed_queue', JSON.stringify(failedQueue));
            } else {
                console.log('Successfully saved to Firebase:', licenseCode);
            }
        });
        
        return true;
    } catch (error) {
        console.error('Exception saving to Firebase:', error);
        return false;
    }
};

// ==================== INISIALISASI ====================
OfflineLicenseSystem.prototype.initialize = function() {
    console.log('Sistem Lisensi Offline - Inisialisasi...');

    // 1. Inisialisasi Firebase secara otomatis
    this.initializeFirebase();
    
    // 2. Tambahkan styles
    this.addStyles();
    
    // 3. Load license yang sudah ada
    this.loadLicense();
    
    // 4. Load validLicenseKeys dari localStorage
    this.loadValidLicenseKeys();
    
    // 5. Cek apakah ada lisensi aktif atau demo aktif
    var hasActiveLicense = this.checkExistingLicense();
    
    // 6. Jika ada demo aktif, terapkan fitur demo
    if (hasActiveLicense && this.currentLicense && this.currentLicense.package === 'demo') {
        console.log('Demo aktif ditemukan, menerapkan fitur demo...');
        this.applyDemoFeatures();
        this.showDemoBriefInfo();
        
        // Setup timer untuk expired popup
        this.setupDemoExpiryTimer();
        return true;
    }
    
    // 7. Jika ada lisensi aktif (bukan demo), validasi
    if (hasActiveLicense) {
        var isValid = this.validateLicense();
        
        if (isValid) {
            // Terapkan fitur lisensi
            this.applyLicenseFeatures();
            this.showBriefLicenseInfo();
            return true;
        } else {
            this.showActivationPopup();
            return false;
        }
    }
    
    // 8. Jika tidak ada lisensi aktif, cek apakah demo pernah digunakan
    var demoUsed = localStorage.getItem(this.demoUsedKey);
    if (demoUsed !== 'true') {
        // Demo belum pernah digunakan, tampilkan popup demo
        this.showWelcomeDemoPopup();
    } else {
        // Demo sudah pernah digunakan, tampilkan popup expired
        this.showDemoExpiredPopup();
    }

    // 9. Setup demo monitor
    this.startDemoMonitor();
    
    return false;
};


// ==================== LICENSE MANAGEMENT ====================
OfflineLicenseSystem.prototype.loadLicense = function() {
    try {
        var saved = localStorage.getItem('adzan_offline_license');
        if (saved) {
            var license = JSON.parse(saved);
            
            // Cek jika ini adalah demo yang sudah expired
            if (license.package === 'demo') {
                var expiryDate = new Date(license.expiry);
                var now = new Date();
                
                if (now >= expiryDate) {
                    // Demo expired, hapus
                    console.log('Demo sudah expired, membersihkan...');
                    this.cleanupExpiredDemo();
                    return;
                }
            }
            
            this.currentLicense = license;
            console.log('Lisensi ditemukan:', this.currentLicense.package);
        }
    } catch (error) {
        console.error('Error loading license:', error);
        this.currentLicense = null;
    }
};

OfflineLicenseSystem.prototype.saveLicense = function() {
    try {
        // Simpan license
        localStorage.setItem('adzan_offline_license', JSON.stringify(this.currentLicense));
        
        // Untuk demo, juga simpan di key lama untuk kompatibilitas
        if (this.currentLicense.package === 'demo') {
            localStorage.setItem('adzanAppLicense', JSON.stringify({
                package: 'demo',
                startDate: this.currentLicense.startDate,
                endDate: this.currentLicense.expiry,
                paymentStatus: 'demo'
            }));
        }
        
        return true;
    } catch (error) {
        console.error('Error saving license:', error);
        return false;
    }
};

OfflineLicenseSystem.prototype.validateLicense = function() {
    if (!this.currentLicense) return false;
    
    // Cek format license
    if (!this.currentLicense.key || !this.currentLicense.expiry) {
        return false;
    }
    
    // Cek apakah kode masih valid
    var licenseInfo = this.validLicenseKeys[this.currentLicense.key];
    if (!licenseInfo) {
        console.log('License key not found in valid keys');
        return false;
    }
    
    // Cek expiry date
    var now = new Date();
    var expiry = new Date(this.currentLicense.expiry);
    
    if (now > expiry) {
        console.log('License expired');
        // Tampilkan popup expired
        this.showExpiredPopup();
        return false;
    }
    
    return true;
};

// ==================== FUNGSI BARU: KELUAR DARI LISENSI ====================
OfflineLicenseSystem.prototype.deactivateLicense = function() {
    if (confirm('Apakah Anda yakin ingin keluar dari lisensi saat ini? Semua data lisensi akan dihapus.')) {
        // Hapus lisensi dari localStorage
        localStorage.removeItem('adzan_offline_license');
        localStorage.removeItem('adzanAppLicense');
        
        // Reset current license
        this.currentLicense = null;
        
        // Hentikan iklan jika berjalan
        if (this.adsTimer) {
            clearInterval(this.adsTimer);
            this.adsTimer = null;
        }
        
        // Tampilkan toast
        this.showToast('Lisensi berhasil dihapus. Silahkan aktivasi lisensi baru.', 'info');
        
        // Tampilkan popup aktivasi setelah 1 detik
        var self = this;
        setTimeout(function() {
            self.showActivationPopup();
        }, 1000);
        
        return true;
    }
    return false;
};

// ==================== FUNGSI BARU: CEK STATUS UPGRADE ====================
OfflineLicenseSystem.prototype.checkUpgradeEligibility = function() {
    if (!this.currentLicense) return false;
    
    var currentPackage = this.currentLicense.package;
    var packagesOrder = ['trial', 'basic', 'premium', 'vip'];
    var currentIndex = packagesOrder.indexOf(currentPackage);
    
    // Jika sudah VIP, tidak bisa upgrade
    if (currentIndex >= 3) {
        return {
            eligible: false,
            message: 'Anda sudah memiliki paket tertinggi (VIP)'
        };
    }
    
    // Hitung berapa hari tersisa
    var expiryDate = new Date(this.currentLicense.expiry);
    var now = new Date();
    var daysLeft = Math.ceil((expiryDate - now) / (1000 * 3600 * 24));
    
    // Jika masa aktif kurang dari 30 hari, beri rekomendasi upgrade
    var recommendation = '';
    if (daysLeft < 30) {
        recommendation = 'Masa aktif tersisa ' + daysLeft + ' hari. Disarankan untuk upgrade.';
    }
    
    return {
        eligible: true,
        currentPackage: currentPackage,
        nextPackage: packagesOrder[currentIndex + 1],
        daysLeft: daysLeft,
        recommendation: recommendation
    };
};

// ==================== FUNGSI BARU: HITUNG HARGA UPGRADE ====================
OfflineLicenseSystem.prototype.calculateUpgradePrice = function(targetPackage) {
    if (!this.currentLicense) return this.licensePackages[targetPackage].price;
    
    var currentPackage = this.currentLicense.package;
    var currentPrice = this.licensePackages[currentPackage].price;
    var targetPrice = this.licensePackages[targetPackage].price;
    
    // Jika upgrade dari trial ke paket berbayar, harga full
    if (currentPackage === 'trial') {
        return targetPrice;
    }
    
    // Hitung sisa nilai paket saat ini (prorata)
    var expiryDate = new Date(this.currentLicense.expiry);
    var startDate = new Date(this.currentLicense.startDate);
    var now = new Date();
    
    var totalDays = Math.ceil((expiryDate - startDate) / (1000 * 3600 * 24));
    var daysUsed = Math.ceil((now - startDate) / (1000 * 3600 * 24));
    var remainingValue = currentPrice * ((totalDays - daysUsed) / totalDays);
    
    // Harga upgrade = harga target - nilai sisa paket saat ini
    var upgradePrice = targetPrice - remainingValue;
    
    // Minimum harga upgrade
    if (upgradePrice < (targetPrice * 0.5)) {
        upgradePrice = targetPrice * 0.5; // Minimum 50% dari harga paket baru
    }
    
    return Math.round(upgradePrice);
};

// ==================== FUNGSI BARU: PANEL ADMIN ONLINE ====================
OfflineLicenseSystem.prototype.showAdminPanel = function(password) {
    if (password !== 'admin123') {
      this.showToast('Password admin salah!', 'error');
      return;
    }
    
    this.removeExistingPopup();
    var overlay = this.createOverlay();
    
    // Generate license list HTML
    var generatedLicenses = JSON.parse(localStorage.getItem('generated_licenses') || '[]');
    var licenseListHTML = '';
    
    if (generatedLicenses.length > 0) {
    licenseListHTML = '<table class="admin-table">' +
    '<thead>' +
        '<tr>' +
        '<th style="width: 180px;">Kode Lisensi</th>' +
        '<th style="width: 100px;">Paket</th>' +
        '<th style="width: 200px;">Device ID</th>' +
        '<th style="width: 150px;">Customer</th>' +
        '<th style="width: 120px;">Tanggal</th>' +
        '<th style="width: 90px;">Status</th>' +
        '</tr>' +
    '</thead>' +
    '<tbody>';

    for (var i = 0; i < generatedLicenses.length; i++) {
    var license = generatedLicenses[i];
    var isCurrentDevice = (license.deviceId === this.deviceId) ? 'current-device' : '';
    
    licenseListHTML += '<tr class="current-device-row">' +
        '<td><code class="license-code-cell">' + license.code + '</code></td>' +
        '<td class="text-center"><span class="table-package-badge ' + (license.package || 'basic') + '">' + (license.package || 'N/A') + '</span></td>' +
        '<td class="device-id-cell">' + (license.deviceId || 'N/A') + '</td>' +
        '<td>' + (license.customerName || 'N/A') + '</td>' +
        '<td>' + new Date(license.generatedAt).toLocaleDateString('id-ID') + '</td>' +
        '<td><span class="status-badge ' + license.status + '">' + license.status.toUpperCase() + '</span></td>' +
    '</tr>';
    }
      
      licenseListHTML += '</tbody></table>';
    } else {
      licenseListHTML = '<div class="empty-state">' +
        '<i class="bi bi-inbox"></i>' +
        '<p>Belum ada kode lisensi yang digenerate</p>' +
      '</div>';
    }
    
    overlay.innerHTML = [
      '<div class="offline-license-popup admin">',
      '    <div class="popup-header">',
      '        <h2>PANEL ADMIN LISENSI ONLINE</h2>',
      '        <p class="subtitle">Generate, Sync, dan Kelola Kode Lisensi</p>',
      '    </div>',
      '    ',
      '    <div class="popup-body">',
      '        <div class="admin-panel">',
      '            <div class="admin-section">',
      '                <h4><i class="bi bi-plus-circle"></i> Generate Kode Baru</h4>',
      '                <div class="admin-form">',
      '                    <div class="form-group">',
      '                        <label><i class="bi bi-box"></i> Pilih Paket</label>',
      '                        <select id="adminPackageSelect" class="admin-select">',
      '                            <option value="trial">Uji Coba (2 hari)</option>',
      '                            <option value="basic">Dasar (1 tahun)</option>',
      '                            <option value="premium">Premium (1 tahun)</option>',
      '                            <option value="vip">VIP (Seumur Hidup)</option>',
      '                        </select>',
      '                    </div>',
      '                    ',
      '                    <div class="form-group">',
      '                        <label><i class="bi bi-laptop"></i> ID Perangkat</label>',
      '                        <input type="text" id="adminDeviceId" class="admin-input" value="' + this.deviceId + '" readonly>',
      '                    </div>',
      '                    ',
      '                    <div class="form-group">',
      '                        <label><i class="bi bi-person"></i> Nama Customer</label>',
      '                        <input type="text" id="adminCustomerName" class="admin-input" placeholder="Nama customer">',
      '                    </div>',
      '                    ',
      '                    <button id="generateLicenseBtn" class="btn-admin-generate">',
      '                        <i class="bi bi-magic"></i> GENERATE KODE LISENSI',
      '                    </button>',
      '                </div>',
      '            </div>',
      '            ',
      '            <div class="admin-section">',
      '                <h4><i class="bi bi-fire"></i> Status Firebase</h4>',
      '                <div class="admin-form">',
      '                    <div class="form-group">',
      '                        <label><i class="bi bi-database"></i> Koneksi Database</label>',
      '                        <div class="setting-value" id="firebaseStatus">' + 
                            (this.isFirebaseInitialized ? 'TERHUBUNG' : 'OFFLINE') + 
                        '</div>',
      '                    </div>',
      '                    ',
      '                    <div class="admin-actions" style="margin-top: 15px;">',
      '                        <button id="testFirebaseBtn" class="btn-admin-secondary">',
      '                            <i class="bi bi-wifi"></i> Test Koneksi Firebase',
      '                        </button>',
      '                        <button id="syncToFirebaseBtn" class="btn-admin-generate">',
      '                            <i class="bi bi-cloud-upload"></i> Sync ke Firebase',
      '                        </button>',
      '                    </div>',
      '                </div>',
      '            </div>',
      '            ',
      '            <div class="admin-section">',
      '                <h4><i class="bi bi-list-check"></i> Kode yang Telah Digenerate</h4>',
      '                <div class="license-list" id="licenseListContainer">',  // TAMBAHKAN ID
            licenseListHTML,
      '                </div>',
      '                <div class="license-stats">',
      '                    <span><i class="bi bi-box"></i> Total: ' + generatedLicenses.length + '</span>',
      '                    <span><i class="bi bi-check-circle"></i> Active: ' + generatedLicenses.filter(function(l) { return l.status === 'active'; }).length + '</span>',
      '                    <span><i class="bi bi-clock"></i> Pending: ' + generatedLicenses.filter(function(l) { return l.status === 'pending'; }).length + '</span>',
      '                </div>',
      '                <div class="admin-actions">',
      '                    <button id="importFromServerBtn" class="btn-admin-secondary">',
      '                        <i class="bi bi-cloud-download"></i> Import dari Firebase',
      '                    </button>',
      '                    <button id="exportLicensesBtn" class="btn-admin-secondary">',
      '                        <i class="bi bi-download"></i> Export ke CSV',
      '                    </button>',
      '                    <button id="clearLicensesBtn" class="btn-admin-danger">',
      '                        <i class="bi bi-trash"></i> Hapus Semua',
      '                    </button>',
      '                    <button id="refreshLicenseListBtn" class="btn-admin-secondary">',
      '                        <i class="bi bi-arrow-clockwise"></i> Refresh List',
      '                    </button>',
      '                </div>',
      '            </div>',
      '            ',
      '            <div class="admin-section">',
      '                <h4><i class="bi bi-gear"></i> Pengaturan Sistem</h4>',
      '                <div class="system-settings">',
      '                    <div class="setting-item">',
      '                        <label><i class="bi bi-shield-check"></i> Valid License Keys</label>',
      '                        <div class="setting-value">' + Object.keys(this.validLicenseKeys).length + ' kode aktif</div>',
      '                    </div>',
      '                    ',
      '                    <div class="setting-item">',
      '                        <label><i class="bi bi-device-ssd"></i> Device ID Aktif</label>',
      '                        <div class="setting-value">' + this.deviceId + '</div>',
      '                    </div>',
      '                    ',
      '                    <div class="setting-item">',
      '                        <label><i class="bi bi-clock-history"></i> Lisensi Saat Ini</label>',
      '                        <div class="setting-value">' + (this.currentLicense ? this.currentLicense.package : 'Tidak ada') + '</div>',
      '                    </div>',
      '                </div>',
      '            </div>',
      '            ',
      '            <button id="closeAdminPanelBtn" class="btn-admin-close">',
      '                <i class="bi bi-x-lg"></i> TUTUP PANEL',
      '            </button>',
      '            <div class="admin-info">',
      '                <p><i class="bi bi-info-circle"></i> Panel Admin - Hanya untuk penggunaan internal</p>',
      '            </div>',
      '        </div>',
      '    </div>',
      '    ',
      '</div>'
    ].join('');
    
    document.body.appendChild(overlay);
    this.darkenBackground();
    
    var self = this;
    
    // Generate license via Firebase
    document.getElementById('generateLicenseBtn').addEventListener('click', function() {
        var packageType = document.getElementById('adminPackageSelect').value;
        var deviceId = document.getElementById('adminDeviceId').value || 'N/A';
        var customerName = document.getElementById('adminCustomerName').value || 'Anonymous';
        
        if (!customerName.trim()) {
            self.showToast('Masukkan nama customer!', 'error');
            return;
        }
        
        // Generate langsung di Firebase
        var licenseCode = self.generateLicenseOnFirebase({
            package: packageType,
            deviceId: deviceId,
            customerName: customerName
        });
        
        if (licenseCode) {
            // Tampilkan popup hasil
            self.showLicenseResultPopup(licenseCode, packageType, customerName, deviceId);
        } else {
            self.showToast('Gagal generate lisensi di Firebase', 'error');
        }
    });
    
    // Test Firebase connection
    document.getElementById('testFirebaseBtn').addEventListener('click', function() {
        if (self.initializeFirebase()) {
            self.showToast('Firebase terhubung!', 'success');
            document.getElementById('firebaseStatus').textContent = 'TERHUBUNG';
            document.getElementById('firebaseStatus').style.color = '#28a745';
        } else {
            self.showToast('Gagal terhubung ke Firebase', 'error');
            document.getElementById('firebaseStatus').textContent = 'OFFLINE';
            document.getElementById('firebaseStatus').style.color = '#dc3545';
        }
    });
    
    // Sync to Firebase
    document.getElementById('syncToFirebaseBtn').addEventListener('click', function() {
        var generatedLicenses = JSON.parse(localStorage.getItem('generated_licenses') || '[]');
        
        if (generatedLicenses.length === 0) {
            self.showToast('Tidak ada data lisensi untuk disync', 'warning');
            return;
        }
        
        var successCount = 0;
        var errorCount = 0;
        
        generatedLicenses.forEach(function(license) {
            if (self.saveLicenseToFirebase(license)) {
                successCount++;
            } else {
                errorCount++;
            }
        });
        
        self.showToast('Sync selesai: ' + successCount + ' berhasil, ' + errorCount + ' gagal', 
                    errorCount === 0 ? 'success' : 'warning');
    });

    // Refresh license list
    document.getElementById('refreshLicenseListBtn').addEventListener('click', function() {
        // Refresh data dari localStorage
        var generatedLicenses = JSON.parse(localStorage.getItem('generated_licenses') || '[]');
        
        if (generatedLicenses.length === 0) {
            document.getElementById('licenseListContainer').innerHTML = 
                '<div class="empty-state">' +
                '    <i class="bi bi-inbox"></i>' +
                '    <p>Belum ada kode lisensi yang digenerate</p>' +
                '</div>';
            return;
        }
        
        var licenseListHTML = '<table class="admin-table">' +
            '<thead>' +
            '<tr>' +
                '<th style="width: 180px;">Kode Lisensi</th>' +
                '<th style="width: 100px;">Paket</th>' +
                '<th style="width: 200px;">Device ID</th>' +
                '<th style="width: 150px;">Customer</th>' +
                '<th style="width: 120px;">Tanggal</th>' +
                '<th style="width: 90px;">Status</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>';
        
            for (var i = 0; i < generatedLicenses.length; i++) {
                var license = generatedLicenses[i];
                var isCurrentDevice = (license.deviceId === this.deviceId) ? 'current-device' : '';
                
                licenseListHTML += '<tr class="current-device-row">' +
                    '<td><code class="license-code-cell">' + license.code + '</code></td>' +
                    '<td class="text-center"><span class="table-package-badge ' + (license.package || 'basic') + '">' + (license.package || 'N/A') + '</span></td>' +
                    '<td class="device-id-cell">' + (license.deviceId || 'N/A') + '</td>' +
                    '<td>' + (license.customerName || 'N/A') + '</td>' +
                    '<td>' + new Date(license.generatedAt).toLocaleDateString('id-ID') + '</td>' +
                    '<td><span class="status-badge ' + license.status + '">' + license.status.toUpperCase() + '</span></td>' +
                '</tr>';
                }
        
        licenseListHTML += '</tbody></table>';
        
        document.getElementById('licenseListContainer').innerHTML = licenseListHTML;
        self.showToast('License list refreshed', 'success');
    });
    
    // Import from Firebase
    document.getElementById('importFromServerBtn').addEventListener('click', function() {
        console.log('=== START FIREBASE IMPORT ===');
        self.showToast('Mengimport data dari Firebase...', 'info');
        
        self.getAllLicensesFromFirebase(function(data, error) {
            console.log('Import callback - data:', data ? 'exists' : 'null', 'error:', error);
            
            if (error) {
                console.error('Import error:', error);
                self.showToast('Import gagal: ' + error, 'error');
                return;
            }
            
            if (!data || Object.keys(data).length === 0) {
                console.log('No data from Firebase');
                self.showToast('Tidak ada data di Firebase', 'warning');
                return;
            }
            
            console.log('Processing', Object.keys(data).length, 'licenses from Firebase');
            
            // Process each license
            var importedLicenses = [];
            var updatedValidKeys = 0;
            
            Object.keys(data).forEach(function(licenseId) {
                var item = data[licenseId];
                console.log('Processing license ID:', licenseId, 'Data:', item);
                
                // Format untuk localStorage
                var formattedLicense = {
                    code: item.licenseKey || licenseId,  // Perhatikan: licenseKey bukan key
                    package: item.package || 'basic',
                    customerName: item.customerName || 'Anonymous',
                    deviceId: item.deviceId || 'N/A',
                    generatedAt: item.generatedAt || new Date().toISOString(),
                    created: item.createdDate || new Date().toISOString().split('T')[0],
                    status: item.status || 'pending',
                    expiryDays: item.expiryDays || 365,
                    price: item.price || 0,
                    expiryDate: item.expiryDate,
                    lastUpdated: item.lastUpdated
                };
                
                importedLicenses.push(formattedLicense);
                
                // Update validLicenseKeys
                if (item.status === 'active' || item.status === 'pending') {
                    self.validLicenseKeys[formattedLicense.code] = {
                        package: item.package,
                        expiryDays: item.package === 'vip' ? 9999 : (item.package === 'trial' ? 2 : 365),
                        created: item.createdDate || new Date().toISOString().split('T')[0]
                    };
                    updatedValidKeys++;
                }
            });
            
            console.log('Imported licenses:', importedLicenses);
            console.log('Updated validLicenseKeys:', updatedValidKeys);
            
            // Save to localStorage
            localStorage.setItem('generated_licenses', JSON.stringify(importedLicenses));
            self.saveValidLicenseKeys();
            
            // Show success message
            self.showToast('Berhasil import ' + importedLicenses.length + ' lisensi dari Firebase!', 'success');
            
            // Log untuk debug
            var savedData = JSON.parse(localStorage.getItem('generated_licenses') || '[]');
            console.log('Saved to localStorage:', savedData.length, 'items');
            if (savedData.length > 0) {
                console.log('First saved item:', savedData[0]);
            }
            
            // Refresh admin panel setelah 1 detik
            setTimeout(function() {
                console.log('Refreshing admin panel...');
                self.showAdminPanel('admin123');
            }, 1000);
            
        });
        
        console.log('=== END FIREBASE IMPORT ===');
    });
    
    // Event listener untuk export
    document.getElementById('exportLicensesBtn').addEventListener('click', function() {
        self.exportLicensesToCSV();
    });
    
    // Event listener untuk clear
    document.getElementById('clearLicensesBtn').addEventListener('click', function() {
        if (confirm('Hapus semua data lisensi yang telah digenerate?')) {
            localStorage.removeItem('generated_licenses');
            self.showToast('Data lisensi berhasil dihapus', 'success');
            setTimeout(function() {
                self.showAdminPanel('admin123'); // Refresh panel
            }, 1000);
        }
    });
    
    // Event listener untuk close
    document.getElementById('closeAdminPanelBtn').addEventListener('click', function() {
        self.removePopup(overlay);
        self.showActivationPopup();
    });
    
    // Adjust height setelah render
    setTimeout(function() {
        self.adjustPopupHeight();
    }, 100);
};

// ==================== FUNGSI BARU: SHOW LICENSE RESULT POPUP ====================
OfflineLicenseSystem.prototype.showLicenseResultPopup = function(licenseCode, packageType, customerName, deviceId) {
    this.removeExistingPopup();
    
    var overlay = this.createOverlay();
    var packageData = this.licensePackages[packageType];
    
    overlay.innerHTML = [
      '<div class="offline-license-popup">',
      '    <div class="popup-header">',
      '        <button class="close-popup-btn" id="closeResultPopupBtn">',
      '            <i class="bi bi-x-lg"></i>',
      '        </button>',
      '        <h2>KODE LISENSI BERHASIL DIGENERATE</h2>',
      '        <p class="subtitle">' + packageData.name + ' - ' + customerName + '</p>',
      '    </div>',
      '    ',
      '    <div class="popup-body">',
      '        <div class="license-result-popup">',
      '            <div class="result-icon">',
      '                <i class="bi bi-check-circle"></i>',
      '            </div>',
      '            ',
      '            <div class="result-details">',
      '                <div class="result-item">',
      '                    <label>Kode Lisensi:</label>',
      '                    <div class="result-value license-code">' + licenseCode + '</div>',
      '                </div>',
      '                ',
      '                <div class="result-item">',
      '                    <label>Paket:</label>',
      '                    <div class="result-value">' + packageData.name + '</div>',
      '                </div>',
      '                ',
      '                <div class="result-item">',
      '                    <label>Customer:</label>',
      '                    <div class="result-value">' + customerName + '</div>',
      '                </div>',
      '                ',
      '                <div class="result-item">',
      '                    <label>Device ID:</label>',
      '                    <div class="result-value">' + deviceId + '</div>',
      '                </div>',
      '                ',
      '                <div class="result-item">',
      '                    <label>Status:</label>',
      '                    <div class="result-value"><span class="status-badge pending">PENDING</span></div>',
      '                </div>',
      '                ',
      '                <div class="result-item">',
      '                    <label>Disimpan di:</label>',
      '                    <div class="result-value">LocalStorage & Firebase</div>',
      '                </div>',
      '            </div>',
      '            ',
      '            <div class="result-actions">',
      '                <button onclick="copyToClipboard(\'' + licenseCode + '\')" class="btn-copy-admin">',
      '                    <i class="bi bi-copy"></i> Salin Kode',
      '                </button>',
      '                <button onclick="window.open(\'https://wa.me/6289609745090?text=Kode%20Lisensi:%20' + encodeURIComponent(licenseCode) + '%0APaket:%20' + encodeURIComponent(packageData.name) + '%0ACustomer:%20' + encodeURIComponent(customerName) + '\', \'_blank\')" class="btn-whatsapp-admin">',
      '                    <i class="bi bi-whatsapp"></i> Kirim via WhatsApp',
      '                </button>',
      '                <button id="backToAdminBtn" class="btn-admin-secondary">',
      '                    <i class="bi bi-arrow-left"></i> Kembali ke Admin Panel',
      '                </button>',
      '            </div>',
      '            ',
      '            <div class="result-note">',
      '                <p><i class="bi bi-info-circle"></i> Kode ini telah tersimpan di database lokal dan Firebase.</p>',
      '                <p>Kode dapat digunakan langsung untuk aktivasi.</p>',
      '            </div>',
      '        </div>',
      '    </div>',
      '    ',
      '</div>'
    ].join('');
    
    document.body.appendChild(overlay);
    this.darkenBackground();
    
    var self = this;
    
    // Event listener untuk tombol close
    document.getElementById('closeResultPopupBtn').addEventListener('click', function() {
        self.removePopup(overlay);
        self.showAdminPanel('admin123'); // Kembali ke admin panel
    });
    
    // Event listener untuk tombol back to admin
    document.getElementById('backToAdminBtn').addEventListener('click', function() {
        self.removePopup(overlay);
        self.showAdminPanel('admin123'); // Kembali ke admin panel
    });
};

// ==================== FUNGSI BARU: EXPORT KE CSV ====================
OfflineLicenseSystem.prototype.exportLicensesToCSV = function() {
    var generatedLicenses = JSON.parse(localStorage.getItem('generated_licenses') || '[]');
    
    if (generatedLicenses.length === 0) {
        this.showToast('Tidak ada data untuk diexport', 'warning');
        return;
    }
    
    // Buat header CSV
    var csv = 'Kode,Paket,Device ID,Customer Name,Generated At,Status\n';
    
    // Tambahkan data
    generatedLicenses.forEach(function(license) {
        csv += [
            license.code,
            license.package,
            license.deviceId || 'N/A',
            license.customerName || 'Anonymous',
            new Date(license.generatedAt).toLocaleDateString('id-ID'),
            license.status
        ].join(',') + '\n';
    });
    
    // Buat blob dan download
    var blob = new Blob([csv], { type: 'text/csv' });
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'license_data_' + new Date().toISOString().split('T')[0] + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    this.showToast('Data berhasil diexport ke CSV', 'success');
};

// TAMBAHKAN FUNGSI INI SEBELUM applyLicenseFeatures:
OfflineLicenseSystem.prototype.setupLeftCarouselForLicense = function(hiddenSlides) {
    // Simpan hidden slides ke localStorage
    localStorage.setItem('license_hidden_slides', JSON.stringify(hiddenSlides || []));
    
    // Panggil fungsi loadLeftCarousel jika ada
    if (typeof window.loadLeftCarousel === 'function') {
        setTimeout(function() {
            window.loadLeftCarousel();
        }, 100);
    }
};

// ==================== APPLY LICENSE FEATURES ====================
OfflineLicenseSystem.prototype.applyLicenseFeatures = function() {
    if (!this.currentLicense) {
        console.log('Tidak ada lisensi aktif');
        return;
    }
    
    var packageData = this.licensePackages[this.currentLicense.package];
    if (!packageData) {
        console.log('Paket tidak ditemukan:', this.currentLicense.package);
        return;
    }
    
    var features = packageData.features;
    console.log('Menerapkan fitur untuk paket:', this.currentLicense.package);
    
    // 1. Hidden logo jika diperlukan
    if (features.hiddenLogo) {
        this.hideElement('#masjidLogo');
    }
    
    // 2. Hidden slide tertentu
    this.setupLeftCarouselForLicense(features.hiddenSlides);

    
    // 3. Hidden tombol ON/OFF
    if (features.hiddenPowerButton) {
        this.hideElement('#screenOffBtn');
    }
    
    // 4. Hidden nama desa dari alamat
    if (features.hiddenVillageName) {
        this.modifyAddress();
    }
    
    // 5. Batasi jumlah gambar
    this.limitImages(features.maxImages);
    
    // 6. Hidden card Imsak dan Syuruq
    if (features.hiddenImsakSyuruq) {
        this.hideElement('#timeImsak');
        this.hideElement('#timeSyuruq');
        this.hideElement('#thSyuruq');
        
        // TAMBAHKAN INI UNTUK HIDE HEADER IMSAK JUGA:
        var thImsak = document.getElementById('thImsak');
        if (thImsak) {
            thImsak.style.display = 'none';
        }
    }
    
    // 7. Teks Maghrib & Isya aktif hanya 15 menit pertama (untuk trial)
    if (features.maghribIsyaActiveMinutes > 0) {
        this.handleMaghribIsyaTimer(features.maghribIsyaActiveMinutes);
    }
    
    // 8. Hidden tombol pengaturan
    for (var j = 0; j < features.hiddenSettingsButtons.length; j++) {
        var buttonType = features.hiddenSettingsButtons[j];
        this.hideSettingsButton(buttonType);
    }
    
    // 9. Hidden tombol atur waktu adzan
    for (var k = 0; k < features.hiddenAdzanButtons.length; k++) {
        var adzanButtonType = features.hiddenAdzanButtons[k];
        this.hideAdzanButton(adzanButtonType);
    }
    
    // 10. Hidden audio
    for (var l = 0; l < features.hiddenAudio.length; l++) {
        var audioType = features.hiddenAudio[l];
        this.disableAudio(audioType);
    }
    
    // Update UI dengan info lisensi
    this.updateLicenseUI();
};

// ==================== HELPER FUNCTIONS FOR FEATURES ====================
OfflineLicenseSystem.prototype.hideElement = function(selector) {
    var element = document.querySelector(selector);
    if (element) {
        element.style.display = 'none';
    }
};

OfflineLicenseSystem.prototype.modifyAddress = function() {
    var addressElement = document.getElementById('masjidAddress');
    if (addressElement) {
        var address = addressElement.textContent;
        var modifiedAddress = address.replace(/Desa\s+\w+,?\s*/i, '');
        addressElement.textContent = modifiedAddress || 'Masjid Al-Muthmainnah';
    }
};

OfflineLicenseSystem.prototype.limitImages = function(maxImages) {
    if (typeof settings !== 'undefined' && settings.uploadedImages) {
        if (settings.uploadedImages.length > maxImages) {
            settings.uploadedImages = settings.uploadedImages.slice(0, maxImages);
            if (typeof saveSettings === 'function') {
                saveSettings();
            }
        }
        
        if (typeof loadMainCarousel === 'function') {
            loadMainCarousel();
        }
    }
};

// GANTI FUNGSI handleMaghribIsyaTimer MENJADI INI:
OfflineLicenseSystem.prototype.handleMaghribIsyaTimer = function(minutes) {
    var firstOpenKey = 'firstOpenTime';
    var firstOpenTime = localStorage.getItem(firstOpenKey);
    
    if (!firstOpenTime) {
        firstOpenTime = new Date().getTime();
        localStorage.setItem(firstOpenKey, firstOpenTime);
    }
    
    var now = new Date().getTime();
    var timeDiff = now - parseInt(firstOpenTime);
    var minutesDiff = timeDiff / (1000 * 60);
    
    if (minutesDiff > minutes) {
        // GANTI TEKS HEADER MENJADI "-----" BUKAN HIDE ELEMENT
        var headerRow = document.getElementById('jadwalHeader');
        if (headerRow) {
            var headers = headerRow.getElementsByTagName('th');
            for (var i = 0; i < headers.length; i++) {
                var headerText = headers[i].textContent.trim();
                if (headerText === 'Maghrib' || headerText === 'Isya') {
                    headers[i].textContent = '-----';
                }
            }
        }
        
        // JANGAN hideElement, tapi biarkan waktu tetap tampil
        // Hanya header yang diganti
    }
};

OfflineLicenseSystem.prototype.hideSettingsButton = function(buttonType) {
    var selector = '';
    
    switch(buttonType) {
        case 'data-masjid':
            selector = 'button[data-bs-target="#offcanvasDataMasjid"]';
            break;
        case 'running-text':
            selector = 'button[data-bs-target="#offcanvasRunningText"]';
            break;
        case 'slider-duration':
            selector = 'button[onclick="showSliderSettingsForm()"]';
            break;
    }
    
    if (selector) {
        this.hideElement(selector);
    }
};

OfflineLicenseSystem.prototype.hideAdzanButton = function(buttonType) {
    var self = this;
    setTimeout(function() {
        var modal = document.getElementById('prayerSettingsModal');
        if (modal) {
            var buttonSelector = '';
            
            if (buttonType === 'countdown-adzan') {
                buttonSelector = 'button[onclick*="adzan"]';
            } else if (buttonType === 'countdown-iqamah') {
                buttonSelector = 'button[onclick*="iqamah"]';
            } else if (buttonType === 'overlay-duration') {
                buttonSelector = 'button[onclick*="overlay"]';
            }
            
            if (buttonSelector) {
                var buttons = modal.querySelectorAll(buttonSelector);
                for (var i = 0; i < buttons.length; i++) {
                    buttons[i].style.display = 'none';
                }
            }
        }
    }, 1000);
};

OfflineLicenseSystem.prototype.disableAudio = function(audioType) {
    var audioId = '';
    
    switch(audioType) {
        case 'shalawat':
            audioId = 'audioShalawat';
            break;
        case 'adzan':
            audioId = 'audioAdzan';
            break;
    }
    
    if (audioId) {
        var audioElement = document.getElementById(audioId);
        if (audioElement) {
            audioElement.src = '';
            audioElement.removeAttribute('src');
        }
    }
};

// ==================== ADS MANAGEMENT ====================
OfflineLicenseSystem.prototype.setupAds = function() {
    if (!this.currentLicense) return;
    
    var packageData = this.licensePackages[this.currentLicense.package];
    if (!packageData.features.ads.enabled) return;
    
    var adsConfig = packageData.features.ads;
    var self = this;
    
    this.adsTimer = setInterval(function() {
        self.showAd(adsConfig);
    }, adsConfig.interval * 60 * 1000);
    
    setTimeout(function() {
        self.showAd(adsConfig);
    }, 10000);
};

OfflineLicenseSystem.prototype.showAd = function(adsConfig) {
    var blackOverlay = document.getElementById('blackOverlay');
    var screenBlack = document.getElementById('screenblack');
    
    if ((blackOverlay && blackOverlay.style.display === 'block') || 
        (screenBlack && screenBlack.style.display === 'block')) {
        
        if (adsConfig.overlayBehavior === 'behind') {
            console.log('Iklan berjalan di belakang overlay');
            return;
        }
    }
    
    if (this.isShowingAds) return;
    
    this.isShowingAds = true;
    
    var randomAd = this.adImages[Math.floor(Math.random() * this.adImages.length)];
    
    var adOverlay = document.createElement('div');
    adOverlay.id = 'adOverlay';
    adOverlay.style.position = 'fixed';
    adOverlay.style.top = '0';
    adOverlay.style.left = '0';
    adOverlay.style.width = '100%';
    adOverlay.style.height = '100%';
    adOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    adOverlay.style.zIndex = '99990';
    adOverlay.style.display = 'flex';
    adOverlay.style.alignItems = 'center';
    adOverlay.style.justifyContent = 'center';
    adOverlay.style.flexDirection = 'column';
    
    adOverlay.innerHTML = [
        '<div style="max-width: 90%; max-height: 90%;">',
        '    <img src="' + randomAd + '" alt="Iklan" style="width: 100%; height: auto; border-radius: 10px;">',
        '</div>',
        '<div id="adCountdown" style="color: white; font-size: 24px; margin-top: 20px; font-weight: bold;">',
        '    ' + adsConfig.duration,
        '</div>'
    ].join('');
    
    document.body.appendChild(adOverlay);
    
    var countdown = adsConfig.duration;
    var countdownElement = document.getElementById('adCountdown');
    var self = this;
    
    var countdownInterval = setInterval(function() {
        countdown--;
        if (countdownElement) {
            countdownElement.textContent = countdown;
        }
        
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            self.removeAd(adOverlay);
        }
    }, 1000);
    
    adOverlay.addEventListener('click', function() {
        clearInterval(countdownInterval);
        self.removeAd(adOverlay);
    });
};

OfflineLicenseSystem.prototype.removeAd = function(adOverlay) {
    if (adOverlay && adOverlay.parentNode) {
        adOverlay.parentNode.removeChild(adOverlay);
    }
    this.isShowingAds = false;
};

OfflineLicenseSystem.prototype.findGeneratedLicense = function(code) {
    var list = JSON.parse(localStorage.getItem('generated_licenses') || '[]');
    for (var i = 0; i < list.length; i++) {
        if (list[i].code === code) {
            return list[i];
        }
    }
    return null;
};

// ==================== ACTIVATION FUNCTIONS ====================
OfflineLicenseSystem.prototype.activateLicense = function(licenseKey) {
    licenseKey = licenseKey.toUpperCase().trim();

    if (!this.isValidLicenseFormat(licenseKey)) {
        return {
            success: false,
            message: 'Format kode lisensi tidak valid'
        };
    }
    
    // Cek status lisensi terlebih dahulu
    var self = this;
    var statusCheckResult = null;
    
    // Gunakan synchronous check
    var generatedLicenses = JSON.parse(localStorage.getItem('generated_licenses') || '[]');
    for (var i = 0; i < generatedLicenses.length; i++) {
        if (generatedLicenses[i].code === licenseKey) {
            var license = generatedLicenses[i];
            
            // Cek jika sudah aktif di perangkat lain
            if (license.status === 'active' && license.deviceId !== this.deviceId) {
                return {
                    success: false,
                    message: 'Kode lisensi sudah aktif di perangkat lain'
                };
            }
            
            // Cek jika sudah expired
            if (license.expiryDate) {
                var expiryDate = new Date(license.expiryDate);
                var now = new Date();
                if (now > expiryDate) {
                    return {
                        success: false,
                        message: 'Kode lisensi telah kadaluarsa'
                    };
                }
            }
            break;
        }
    }

    // 1. Cek di Firebase terlebih dahulu
    var firebaseCheck = false;
    var firebaseData = null;
    
    // Gunakan callback untuk mendapatkan data Firebase
    this.validateLicenseWithFirebase(licenseKey, function(data) {
        if (data) {
            firebaseCheck = true;
            firebaseData = data;
            
            // Cek status dari Firebase
            if (data.status === 'active' && data.deviceId !== self.deviceId && data.activatedDevice !== self.deviceId) {
                self.showToast('Kode lisensi sudah aktif di perangkat lain', 'error');
                return {
                    success: false,
                    message: 'Kode lisensi sudah aktif di perangkat lain'
                };
            }
            
            // Cek jika expired
            if (data.expiryDate) {
                var expiryDate = new Date(data.expiryDate);
                var now = new Date();
                if (now > expiryDate) {
                    self.showToast('Kode lisensi telah kadaluarsa', 'error');
                    return {
                        success: false,
                        message: 'Kode lisensi telah kadaluarsa'
                    };
                }
            }
        }
    });

    // 2. Cek di lokal (sebagai fallback)
    var licenseInfo = this.validLicenseKeys[licenseKey];
    
    if (!licenseInfo && !firebaseCheck) {
        return {
            success: false,
            message: 'Kode lisensi tidak ditemukan'
        };
    }

    // 3. Tentukan paket
    var packageType;
    if (licenseInfo) {
        packageType = licenseInfo.package;
    } else if (firebaseData) {
        packageType = firebaseData.package || 'basic';
    } else {
        packageType = 'basic';
    }
    
    var pkg = this.licensePackages[packageType];
    var startDate = new Date();
    var expiryDate = new Date();

    // 4. Hitung expiry date
    if (packageType === 'vip') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 100);
    } else if (packageType === 'trial') {
        expiryDate.setDate(expiryDate.getDate() + 2);
    } else {
        expiryDate.setDate(expiryDate.getDate() + 365);
    }

    // 5. Simpan lisensi aktif
    this.currentLicense = {
        key: licenseKey,
        package: packageType,
        startDate: startDate.toISOString(),
        expiry: expiryDate.toISOString(),
        deviceId: this.deviceId,
        activatedAt: new Date().toISOString(),
        status: 'active'
    };

    this.saveLicense();

    // 6. Simpan ke Firebase
    this.saveLicenseToFirebase(this.currentLicense);

    // 7. Update status di Firebase jika dari Firebase
    if (firebaseCheck) {
        this.updateLicenseInFirebase(licenseKey, {
            status: 'active',
            activatedAt: new Date().toISOString(),
            activatedDevice: this.deviceId
        });
    }
    
    // 8. Update status di lokal
    for (var j = 0; j < generatedLicenses.length; j++) {
        if (generatedLicenses[j].code === licenseKey) {
            generatedLicenses[j].status = 'active';
            generatedLicenses[j].deviceId = this.deviceId;
            localStorage.setItem('generated_licenses', JSON.stringify(generatedLicenses));
            break;
        }
    }

    return {
        success: true,
        data: {
            package: packageType,
            expiry: expiryDate.toISOString()
        }
    };
};

OfflineLicenseSystem.prototype.isValidLicenseFormat = function(key) {
    var pattern = /^RH-MTV-[A-Z0-9]{6}$/;
    return pattern.test(key);
};

// ==================== FUNGSI BARU: CEK STATUS LISENSI ====================
OfflineLicenseSystem.prototype.checkLicenseStatus = function(licenseKey, callback) {
    // Cek di data lokal terlebih dahulu
    var generatedLicenses = JSON.parse(localStorage.getItem('generated_licenses') || '[]');
    
    for (var i = 0; i < generatedLicenses.length; i++) {
        if (generatedLicenses[i].code === licenseKey) {
            var license = generatedLicenses[i];
            var isExpired = false;
            
            // Cek apakah sudah kadaluarsa
            if (license.expiryDate) {
                var expiryDate = new Date(license.expiryDate);
                var now = new Date();
                if (now > expiryDate) {
                    isExpired = true;
                }
            }
            
            if (callback) callback({
                status: license.status || 'pending',
                deviceId: license.deviceId,
                expiryDate: license.expiryDate,
                isExpired: isExpired,
                package: license.package
            });
            return;
        }
    }
    
    // Cek di Firebase jika tidak ditemukan di lokal
    var self = this;
    this.validateLicenseWithFirebase(licenseKey, function(firebaseData) {
        if (firebaseData) {
            var isExpired = false;
            
            // Cek apakah sudah kadaluarsa
            if (firebaseData.expiryDate) {
                var expiryDate = new Date(firebaseData.expiryDate);
                var now = new Date();
                if (now > expiryDate) {
                    isExpired = true;
                }
            }
            
            if (callback) callback({
                status: firebaseData.status || 'pending',
                deviceId: firebaseData.deviceId || firebaseData.activatedDevice,
                expiryDate: firebaseData.expiryDate,
                isExpired: isExpired,
                package: firebaseData.package
            });
        } else {
            if (callback) callback(null);
        }
    });
};

// ==================== POPUP SYSTEM (DIPERBAIKI) ====================
OfflineLicenseSystem.prototype.showActivationPopup = function() {
    this.removeExistingPopup();
    
    var overlay = this.createOverlay();
    
    // Cek eligibility untuk demo terlebih dahulu
    var eligibility = this.checkDemoEligibility();
    var demoButtonHTML = '';
    
    if (eligibility.eligible) {
        demoButtonHTML = [
            '<button id="demoModeBtn" class="btn-demo-mode">',
            '    <i class="bi bi-play-circle"></i>',
            '    <span>COBA DEMO (15 MENIT)</span>',
            '</button>',
            '',
            '<div class="divider">',
            '    <span>ATAU</span>',
            '</div>'
        ].join('');
    } else {
        demoButtonHTML = [
            '<div class="demo-not-eligible alert alert-warning">',
            '    <i class="bi bi-exclamation-triangle"></i>',
            '    ' + eligibility.message,
            '</div>'
        ].join('');
    }
    
    overlay.innerHTML = [
        '<div class="offline-license-popup">',
        '    <div class="popup-header">',
        '        <h2>AKTIVASI LISENSI OFFLINE</h2>',
        '        <p class="subtitle">Masukkan kode lisensi yang diberikan admin</p>',
        '    </div>',
        '    ',
        '    <div class="popup-body">',
        '        <div class="activation-card">',
        '            <div class="status-indicator inactive">',
        '                <div class="status-dot"></div>',
        '                <span>STATUS: BELUM AKTIF</span>',
        '            </div>',
        '            ',
        '            <div class="license-input-section">',
        '                <div class="input-group">',
        '                    <div class="input-label">',
        '                        <i class="bi bi-key-fill"></i>',
        '                        KODE LISENSI',
        '                    </div>',
        '                    <input ',
        '                        type="text" ',
        '                        id="offlineLicenseKey"',
        '                        placeholder="Contoh: RH-MTV-1Q2W3E"',
        '                        class="license-input"',
        '                        autocomplete="off"',
        '                        maxlength="14"',
        '                        autofocus',
        '                    />',
        '                    <div class="input-hint">',
        '                        Format: RH-MTV-XXXXXX (6 karakter/huruf)',
        '                    </div>',
        '                </div>',
        '                ',
        '                <div class="package-preview" id="packagePreview">',
        '                    <div class="preview-placeholder">',
        '                        <i class="bi bi-box"></i>',
        '                        <p>Paket akan terdeteksi otomatis</p>',
        '                    </div>',
        '                </div>',
        '            </div>',
        '            ',
        '            <div class="action-section">',
        '                <button id="activateOfflineBtn" class="btn-activate-large">',
        '                    <i class="bi bi-check-circle"></i>',
        '                    <span>AKTIVASI LISENSI</span>',
        '                </button>',
        '                ',
        '                <div class="divider">',
        '                    <span>ATAU</span>',
        '                </div>',
        '                ',
        demoButtonHTML,
        '                ',
        '                <button id="contactAdminBtn" class="btn-contact">',
        '                    <i class="bi bi-whatsapp"></i>',
        '                    <span>HUBUNGI ADMIN</span>',
        '                </button>',
        '                ',
        '                <button id="enterAdminPanelBtn" class="btn-admin-panel">',
        '                    <i class="bi bi-person-badge"></i>',
        '                    <span>PANEL ADMIN</span>',
        '                </button>',
        '            </div>',
        '            ',
        '            <div class="info-section">',
        '                <div class="info-box">',
        '                    <h4><i class="bi bi-info-circle"></i> CARA MENDAPATKAN KODE:</h4>',
        '                    <ol>',
        '                        <li>Hubungi admin via WhatsApp</li>',
        '                        <li>Pilih paket yang diinginkan</li>',
        '                        <li>Lakukan pembayaran</li>',
        '                        <li>Admin akan kirim kode lisensi</li>',
        '                        <li>Masukkan kode di atas</li>',
        '                    </ol>',
        '                </div>',
        '                ',
        '                <div class="device-info">',
        '                    <p><strong>ID Perangkat Anda:</strong></p>',
        '                    <code class="device-id">' + this.deviceId + '</code>',
        '                    <button onclick="copyToClipboard(\'' + this.deviceId + '\')" class="btn-copy">',
        '                        <i class="bi bi-copy"></i> Salin ID',
        '                    </button>',
        '                </div>',
        '                ',
        '                <div class="contact-details">',
        '                    <p><i class="bi bi-whatsapp"></i> <strong>Admin:</strong> 089609745090</p>',
        '                    <p><i class="bi bi-envelope"></i> <strong>Email:</strong> mahallahtv@gmail.com</p>',
        '                </div>',
        '            </div>',
        '        </div>',
        '    </div>',
        '</div>'
    ].join('');
    
    document.body.appendChild(overlay);
    
    this.setupActivationEvents(overlay);
    this.setupPackagePreview();
    this.darkenBackground();
    
    // Adjust height setelah render
    var self = this;
    setTimeout(function() {
        self.adjustPopupHeight();
    }, 100);
};

// ==================== FUNGSI BARU: SHOW EXPIRED POPUP ====================
OfflineLicenseSystem.prototype.showExpiredPopup = function() {
  this.removeExistingPopup();
  
  var overlay = this.createOverlay();
  overlay.style.pointerEvents = 'auto';
  
  overlay.innerHTML = [
      '<div class="offline-license-popup expired">',
      '    <div class="popup-header expired">',
      '        <div class="header-icon">',
      '            <i class="bi bi-exclamation-triangle-fill"></i>',
      '        </div>',
      '        <h2>LISENSI KADALUARSA</h2>',
      '        <p class="subtitle">Aplikasi terkunci hingga diperpanjang</p>',
      '    </div>',
      '    ',
      '    <div class="popup-body">',
      '        <div class="expired-warning-card">',
      '            <div class="warning-icon">',
      '                <i class="bi bi-lock-fill"></i>',
      '            </div>',
      '            ',
      '            <h3>MASA AKTIF TELAH BERAKHIR</h3>',
      '            ',
      '            <div class="warning-message">',
      '                <p>Aplikasi tidak dapat digunakan karena lisensi telah habis masa berlakunya.</p>',
      '                <p>Untuk melanjutkan penggunaan, silahkan perpanjang lisensi.</p>',
      '            </div>',
      '            ',
      '            <div class="package-comparison">',
      '                <h4><i class="bi bi-gift"></i> PAKET TERSEDIA:</h4>',
      '                <div class="packages-grid">',
      '                    <div class="package-card basic">',
      '                        <h5>DASAR</h5>',
      '                        <div class="price">Rp 340.000</div>',
      '                        <div class="duration">1 TAHUN</div>',
      '                        <ul>',
      '                            <li>2 Gambar</li>',
      '                            <li>Iklan terbatas</li>',
      '                            <li>Audio terbatas</li>',
      '                        </ul>',
      '                    </div>',
      '                    ',
      '                    <div class="package-card premium">',
      '                        <div class="popular-badge">POPULER</div>',
      '                        <h5>PREMIUM</h5>',
      '                        <div class="price">Rp 570.000</div>',
      '                        <div class="duration">1 TAHUN</div>',
      '                        <ul>',
      '                            <li>5 Gambar</li>',
      '                            <li>Tanpa iklan</li>',
      '                            <li>Audio lengkap</li>',
      '                        </ul>',
      '                    </div>',
      '                    ',
      '                    <div class="package-card vip">',
      '                        <div class="vip-badge">VIP</div>',
      '                        <h5>VIP</h5>',
      '                        <div class="price">Rp 1.420.000</div>',
      '                        <div class="duration">SEUMUR HIDUP</div>',
      '                        <ul>',
      '                            <li>7 Gambar</li>',
      '                            <li>Semua fitur</li>',
      '                            <li>+ STB & Kabel HDMI</li>',
      '                        </ul>',
      '                    </div>',
      '                </div>',
      '            </div>',
      '            ',
      '            <div class="contact-actions">',
      '                <a href="https://wa.me/6289609745090?text=Halo%20Admin,%20saya%20ingin%20perpanjang%20lisensi%20Adzan%20App.%20ID%20Perangkat:%20' + encodeURIComponent(this.deviceId) + '" ',
      '                   target="_blank" class="btn-whatsapp">',
      '                    <i class="bi bi-whatsapp"></i> HUBUNGI ADMIN VIA WHATSAPP',
      '                </a>',
      '                ',
      '                <button onclick="copyToClipboard(\'' + this.deviceId + '\')" class="btn-copy-id">',
      '                    <i class="bi bi-copy"></i> SALIN ID PERANGKAT',
      '                </button>',
      '                ',
      '                <button id="tryDemoAgainBtn" class="btn-demo-again">',
      '                    <i class="bi bi-play-circle"></i> COBA DEMO LAGI (15 MENIT)',
      '                </button>',
      '            </div>',
      '        </div>',
      '    </div>',
      '    ',
      '    <div class="popup-footer">',
      '        <div class="cannot-close-warning">',
      '            <i class="bi bi-shield-exclamation"></i>',
      '            APLIKASI TERKUNCI SAMPAI LISENSI DIPERPANJANG',
      '        </div>',
      '    </div>',
      '</div>'
  ].join('');
  
  document.body.appendChild(overlay);
  
  var self = this;
  
  // Event listener untuk demo again
  document.getElementById('tryDemoAgainBtn').addEventListener('click', function() {
      self.activateDemoMode();
      self.removePopup(overlay);
  });
  
  this.disableAppInteractions();
  
  // Adjust height setelah render
  setTimeout(function() {
      self.adjustPopupHeight();
  }, 100);
};

// ==================== FUNGSI BARU: SHOW LICENSE DETAILS POPUP ====================
OfflineLicenseSystem.prototype.showLicenseDetailsPopup = function() {
    this.removeExistingPopup();
    
    var overlay = this.createOverlay();
    
    if (!this.currentLicense) {
        overlay.innerHTML = [
            '<div class="offline-license-popup">',
            '    <div class="popup-header">',
            '        <h2>INFORMASI LISENSI</h2>',
            '        <p class="subtitle">Tidak ada lisensi aktif</p>',
            '    </div>',
            '    <div class="popup-body">',
            '        <div class="license-details-card">',
            '            <p>Belum ada lisensi yang diaktifkan pada perangkat ini.</p>',
            '            <button id="activateLicenseBtn" class="btn-activate-large" style="margin-top: 20px;">',
            '                <i class="bi bi-key-fill"></i> AKTIVASI LISENSI',
            '            </button>',
            '        </div>',
            '    </div>',
            '</div>'
        ].join('');
        
        document.body.appendChild(overlay);
        
        var self = this;
        var activateBtn = document.getElementById('activateLicenseBtn');
        if (activateBtn) {
            activateBtn.addEventListener('click', function() {
                self.removePopup(overlay);
                self.showActivationPopup();
            });
        }
        
        return;
    }
    
    var packageData = this.licensePackages[this.currentLicense.package];
    var expiryDate = new Date(this.currentLicense.expiry);
    var now = new Date();
    var daysLeft = Math.ceil((expiryDate - now) / (1000 * 3600 * 24));
    var status = daysLeft > 0 ? 'active' : 'expired';
    
    overlay.innerHTML = [
        '<div class="offline-license-popup">',
        '    <div class="popup-header ' + status + '">',
        '        <h2>INFORMASI LISENSI</h2>',
        '        <p class="subtitle">' + packageData.name + ' - ' + (daysLeft > 0 ? daysLeft + ' hari tersisa' : 'Kadaluarsa') + '</p>',
        '    </div>',
        '    ',
        '    <div class="popup-body">',
        '        <div class="license-details-card">',
        '            <div class="status-indicator ' + status + '">',
        '                <div class="status-dot"></div>',
        '                <span>STATUS: ' + (status === 'active' ? 'AKTIF' : 'KADALUARSA') + '</span>',
        '            </div>',
        '            ',
        '            <div class="details-grid">',
        '                <div class="detail-item">',
        '                    <label><i class="bi bi-box"></i> Paket</label>',
        '                    <div class="detail-value">' + packageData.name + '</div>',
        '                </div>',
        '                ',
        '                <div class="detail-item">',
        '                    <label><i class="bi bi-key"></i> Kode Lisensi</label>',
        '                    <div class="detail-value license-key">' + this.currentLicense.key + '</div>',
        '                </div>',
        '                ',
        '                <div class="detail-item">',
        '                    <label><i class="bi bi-calendar-check"></i> Aktif Sejak</label>',
        '                    <div class="detail-value">' + new Date(this.currentLicense.startDate).toLocaleDateString('id-ID') + '</div>',
        '                </div>',
        '                ',
        '                <div class="detail-item">',
        '                    <label><i class="bi bi-calendar-x"></i> Berakhir Pada</label>',
        '                    <div class="detail-value">' + expiryDate.toLocaleDateString('id-ID') + '</div>',
        '                </div>',
        '                ',
        '                <div class="detail-item">',
        '                    <label><i class="bi bi-clock"></i> Sisa Waktu</label>',
        '                    <div class="detail-value">' + (daysLeft > 0 ? daysLeft + ' hari' : 'Telah berakhir') + '</div>',
        '                </div>',
        '                ',
        '                <div class="detail-item">',
        '                    <label><i class="bi bi-device-ssd"></i> Device ID</label>',
        '                    <div class="detail-value">' + this.deviceId + '</div>',
        '                </div>',
        '            </div>',
        '            ',
        '            <div class="features-list">',
        '                <h4><i class="bi bi-stars"></i> Fitur yang Aktif:</h4>',
        '                <ul>',
        '                    <li class="feature-' + (packageData.features.maxImages >= 2 ? 'active' : 'inactive') + '">',
        '                        <i class="bi bi-images"></i> Slide Gambar: ' + packageData.features.maxImages + ' gambar maksimal',
        '                    </li>',
        '                    <li class="feature-' + (packageData.features.hiddenAudio.length === 0 ? 'active' : 'inactive') + '">',
        '                        <i class="bi bi-music-note-beamed"></i> Audio: ' + (packageData.features.hiddenAudio.length === 0 ? 'Lengkap' : 'Terbatas'),
        '                    </li>',
        '                    <li class="feature-' + (!packageData.features.ads.enabled ? 'active' : 'inactive') + '">',
        '                        <i class="bi bi-megaphone"></i> Iklan: ' + (packageData.features.ads.enabled ? 'Ada' : 'Tidak ada'),
        '                    </li>',
        '                    <li class="feature-' + (packageData.features.hiddenSlides.length === 0 ? 'active' : 'inactive') + '">',
        '                        <i class="bi bi-display"></i> Slide: ' + (packageData.features.hiddenSlides.length === 0 ? 'Semua terbuka' : 'Terbatas'),
        '                    </li>',
        '                    <li class="feature-' + (!packageData.features.hiddenImsakSyuruq ? 'active' : 'inactive') + '">',
        '                        <i class="bi bi-clock"></i> Waktu Imsak & Syuruq: ' + (packageData.features.hiddenImsakSyuruq ? 'Tersembunyi' : 'Tampil'),
        '                    </li>',
        '                </ul>',
        '            </div>',
        '            ',
        '            <div class="action-buttons">',
        '                <button id="upgradeLicenseBtn" class="btn-upgrade-now">',
        '                    <i class="bi bi-arrow-up-circle"></i> UPGRADE LISENSI',
        '                </button>',
        '                <button id="deactivateLicenseBtn" class="btn-deactivate">',
        '                    <i class="bi bi-power"></i> KELUAR DARI LISENSI',
        '                </button>',
        '                <button id="closeDetailsBtn" class="btn-close">',
        '                    <i class="bi bi-check-lg"></i> TUTUP',
        '                </button>',
        '            </div>',
        '        </div>',
        '    </div>',
        '</div>'
    ].join('');
    
    document.body.appendChild(overlay);
    this.darkenBackground();
    
    var self = this;
    
    // Event listeners dengan validasi
    var upgradeBtn = document.getElementById('upgradeLicenseBtn');
    var deactivateBtn = document.getElementById('deactivateLicenseBtn');
    var closeBtn = document.getElementById('closeDetailsBtn');
    
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', function() {
            self.removePopup(overlay);
            self.showUpgradePopup();
        });
    }
    
    if (deactivateBtn) {
        deactivateBtn.addEventListener('click', function() {
            if (confirm('Apakah Anda yakin ingin keluar dari lisensi saat ini?\n\nSemua data lisensi akan dihapus dari perangkat ini.')) {
                self.deactivateLicense();
                self.removePopup(overlay);
            }
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            self.removePopup(overlay);
        });
    }
    
    // Adjust height
    setTimeout(function() {
        self.adjustPopupHeight();
    }, 100);
};

OfflineLicenseSystem.prototype.showBriefLicenseInfo = function() {
    if (!this.currentLicense) return;
    
    // Hapus badge lama jika ada
    var oldBadge = document.getElementById('licenseInfoBadge');
    if (oldBadge && oldBadge.parentNode) {
        oldBadge.parentNode.removeChild(oldBadge);
    }
    
    var packageData = this.licensePackages[this.currentLicense.package];
    var expiryDate = new Date(this.currentLicense.expiry);
    var now = new Date();
    var daysLeft = Math.ceil((expiryDate - now) / (1000 * 3600 * 24));
    
    // Buat badge info
    var licenseBadge = document.createElement('div');
    licenseBadge.id = 'licenseInfoBadge';
    licenseBadge.style.cssText = [
        'position: fixed;',
        'bottom: 0px;',
        'right: 0px;',
        'background: linear-gradient(135deg, #005a31 0%, #00816d 100%);',
        'color: white;',
        'padding: 8px 15px;',
        'border-radius: 20px 0px 0px 20px;',
        'z-index: 9998;',
        'font-size: 12px;',
        'cursor: pointer;',
        'display: flex;',
        'align-items: center;',
        'gap: 8px;',
        'box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);',
        'transition: all 0.3s;'
    ].join('');
    
    // Tentukan warna berdasarkan hari tersisa
    if (daysLeft <= 7) {
        licenseBadge.style.background = 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)';
    } else if (daysLeft <= 30) {
        licenseBadge.style.background = 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)';
    }
    
    licenseBadge.innerHTML = [
        '<i class="bi bi-shield-check" style="font-size: 14px;"></i>',
        '<span><b>' + packageData.name + '</b> (' + daysLeft + ' hari)</span>'
    ].join('');
    
    document.body.appendChild(licenseBadge);
    
    var self = this;
    if (licenseBadge) {
        licenseBadge.addEventListener('click', function() {
            self.showLicenseDetailsPopup();
        });
    }
    
    // Hover effect
    licenseBadge.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(-5px)';
        this.style.boxShadow = '0 -2px 15px rgba(0, 0, 0, 0.4)';
    });
    
    licenseBadge.addEventListener('mouseleave', function() {
        this.style.transform = 'translateX(0)';
        this.style.boxShadow = '0 -2px 10px rgba(0, 0, 0, 0.3)';
    });
};

OfflineLicenseSystem.prototype.showUpgradePopup = function() {
    if (!this.currentLicense) {
        this.showToast('Tidak ada lisensi aktif untuk diupgrade', 'error');
        return;
    }
    
    var upgradeInfo = this.checkUpgradeEligibility();
    
    if (!upgradeInfo.eligible) {
        this.showToast(upgradeInfo.message, 'info');
        return;
    }
    
    this.removeExistingPopup();
    var overlay = this.createOverlay();
    
    var currentPackage = this.currentLicense.package;
    var targetPackage = upgradeInfo.nextPackage;
    var targetPackageData = this.licensePackages[targetPackage];
    var upgradePrice = this.calculateUpgradePrice(targetPackage);
    
    overlay.innerHTML = [
        '<div class="offline-license-popup upgrade">',
        '    <div class="popup-header">',
        '        <h2>UPGRADE LISENSI</h2>',
        '        <p class="subtitle">Naikkan paket untuk fitur lebih lengkap</p>',
        '    </div>',
        '    ',
        '    <div class="popup-body">',
        '        <div class="upgrade-container">',
        '            <div class="current-package-info">',
        '                <h4><i class="bi bi-box-arrow-up"></i> Upgrade dari:</h4>',
        '                <div class="current-package-card ' + currentPackage + '">',
        '                    <h5>' + this.licensePackages[currentPackage].name + '</h5>',
        '                    <p>Sisa waktu: ' + upgradeInfo.daysLeft + ' hari</p>',
        '                </div>',
        '            </div>',
        '            ',
        '            <div class="upgrade-options-grid">',
        '                <div class="upgrade-option ' + targetPackage + '">',
        '                    <div class="option-badge">REKOMENDASI</div>',
        '                    <h4>' + targetPackageData.name + '</h4>',
        '                    <div class="option-price">Rp ' + upgradePrice.toLocaleString('id-ID') + '</div>',
        '                    <div class="option-original-price">Rp ' + targetPackageData.price.toLocaleString('id-ID') + '</div>',
        '                    <div class="option-duration">1 TAHUN</div>',
        '                    ',
        '                    <ul class="option-features">',
        '                        <li><i class="bi bi-check-circle"></i> ' + targetPackageData.features.maxImages + ' gambar maksimal</li>',
        '                        <li><i class="bi ' + (targetPackageData.features.ads.enabled ? 'bi-x-circle' : 'bi-check-circle') + '"></i> ' + (targetPackageData.features.ads.enabled ? 'Dengan iklan' : 'Tanpa iklan') + '</li>',
        '                        <li><i class="bi ' + (targetPackageData.features.hiddenAudio.length === 0 ? 'bi-check-circle' : 'bi-x-circle') + '"></i> Audio ' + (targetPackageData.features.hiddenAudio.length === 0 ? 'lengkap' : 'terbatas') + '</li>',
        '                        <li><i class="bi bi-check-circle"></i> Semua slide terbuka</li>',
        '                    </ul>',
        '                    ',
        '                    <button id="confirmUpgradeBtn" class="btn-confirm-upgrade">',
        '                        <i class="bi bi-arrow-up-circle"></i> UPGRADE SEKARANG',
        '                    </button>',
        '                </div>',
        '            </div>',
        '            ',
        '            <div class="upgrade-instruction">',
        '                <h4><i class="bi bi-info-circle"></i> Cara Upgrade:</h4>',
        '                <div class="instruction-content">',
        '                    <p>1. Hubungi admin via WhatsApp untuk proses upgrade</p>',
        '                    <p>2. Kirim ID Perangkat Anda: <code>' + this.deviceId + '</code></p>',
        '                    <p>3. Admin akan mengirimkan kode lisensi baru</p>',
        '                    <p>4. Aktifkan kode baru di aplikasi</p>',
        '                </div>',
        '                ',
        '                <div class="device-id-reminder">',
        '                    <p><i class="bi bi-exclamation-triangle"></i> Salin ID Perangkat Anda:</p>',
        '                    <code>' + this.deviceId + '</code>',
        '                    <button onclick="copyToClipboard(\'' + this.deviceId + '\')" class="btn-copy-id">',
        '                        <i class="bi bi-copy"></i> Salin ID',
        '                    </button>',
        '                </div>',
        '                ',
        '                <div class="instruction-actions">',
        '                    <a href="https://wa.me/6289609745090?text=Halo%20Admin,%20saya%20ingin%20upgrade%20lisensi%20dari%20' + currentPackage + '%20ke%20' + targetPackage + '.%20ID%20Perangkat:%20' + encodeURIComponent(this.deviceId) + '" target="_blank" class="btn-whatsapp">',
        '                        <i class="bi bi-whatsapp"></i> HUBUNGI ADMIN VIA WHATSAPP',
        '                    </a>',
        '                    <button id="cancelUpgradeBtn" class="btn-cancel-upgrade">',
        '                        <i class="bi bi-x-lg"></i> BATAL',
        '                    </button>',
        '                </div>',
        '            </div>',
        '        </div>',
        '    </div>',
        '</div>'
    ].join('');
    
    document.body.appendChild(overlay);
    this.darkenBackground();
    
    var self = this;
    
    document.getElementById('confirmUpgradeBtn').addEventListener('click', function() {
        // Logic untuk upgrade langsung jika ada
        alert('Untuk upgrade, silahkan hubungi admin via WhatsApp terlebih dahulu.');
    });
    
    document.getElementById('cancelUpgradeBtn').addEventListener('click', function() {
        self.removePopup(overlay);
    });
    
    setTimeout(function() {
        self.adjustPopupHeight();
    }, 100);
};

// ==================== HELPER FUNCTIONS ====================
OfflineLicenseSystem.prototype.createOverlay = function() {
  var overlay = document.createElement('div');
  overlay.id = 'offlineLicenseOverlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.92)';
  overlay.style.zIndex = '99999';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'flex-start';
  overlay.style.justifyContent = 'center';
  overlay.style.padding = '20px';
  overlay.style.animation = 'fadeIn 0.4s ease';
  overlay.style.overflowY = 'auto';
  overlay.style.overflowX = 'hidden';
  return overlay;
};

OfflineLicenseSystem.prototype.removeExistingPopup = function() {
  var existing = document.getElementById('offlineLicenseOverlay');
  if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
  }
  this.restoreBackground();
};

OfflineLicenseSystem.prototype.setupActivationEvents = function(overlay) {
  var self = this;
  var activateBtn = overlay.querySelector('#activateOfflineBtn');
  var licenseInput = overlay.querySelector('#offlineLicenseKey');
  
  if (!activateBtn || !licenseInput) {
      console.error('Element not found for activation events');
      return;
  }
  
  // Event untuk fokus pada input
  licenseInput.addEventListener('focus', function() {
      self.toggleFocusedInputMode(true, overlay);
  });
  
  // Event untuk klik di dalam input group (jika user klik area sekitar input)
  var inputGroup = overlay.querySelector('.input-group');
  if (inputGroup) {
      inputGroup.addEventListener('click', function(e) {
          if (e.target !== licenseInput && !licenseInput.matches(':focus')) {
              licenseInput.focus();
          }
      });
  }
  
  activateBtn.addEventListener('click', function() {
      self.processActivation(overlay, activateBtn, licenseInput);
  });
  
  licenseInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
          self.processActivation(overlay, activateBtn, licenseInput);
      }
  });
  
  // CEK ELEMEN SEBELUM MENAMBAHKAN EVENT LISTENER
  var demoModeBtn = overlay.querySelector('#demoModeBtn');
  if (demoModeBtn) {
      demoModeBtn.addEventListener('click', function() {
          self.activateDemoMode();
          self.removePopup(overlay);
      });
  }
  
  var contactAdminBtn = overlay.querySelector('#contactAdminBtn');
  if (contactAdminBtn) {
      contactAdminBtn.addEventListener('click', function() {
          window.open('https://wa.me/6289609745090?text=Halo%20Admin,%20saya%20ingin%20membeli%20lisensi%20Adzan%20App.%20ID%20Perangkat:%20' + encodeURIComponent(self.deviceId), '_blank');
      });
  }
  
  // Event listener untuk panel admin
  var enterAdminPanelBtn = overlay.querySelector('#enterAdminPanelBtn');
  if (enterAdminPanelBtn) {
      enterAdminPanelBtn.addEventListener('click', function() {
          var password = prompt('Masukkan password admin:');
          if (password) {
              self.showAdminPanel(password);
          }
      });
  }

  
  // Setup package preview
  this.setupPackagePreview();
};

OfflineLicenseSystem.prototype.processActivation = function(overlay, activateBtn, licenseInput) {
  var self = this;
  var licenseKey = licenseInput.value.trim();
  
  if (!licenseKey) {
      this.showToast('Masukkan kode lisensi', 'error');
      licenseInput.focus();
      return;
  }
  
  activateBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> MEMPROSES...';
  activateBtn.disabled = true;
  
  setTimeout(function() {
      var result = self.activateLicense(licenseKey);
      
      if (result.success) {
          self.showToast('✓ Lisensi ' + self.licensePackages[result.data.package].name + ' berhasil diaktifkan!', 'success');
          
          activateBtn.innerHTML = '<i class="bi bi-check-circle"></i> BERHASIL!';
          activateBtn.className = 'btn-success-large';
          
          setTimeout(function() {
              self.removePopup(overlay);
              setTimeout(function() {
                  location.reload();
              }, 500);
          }, 2000);
          
      } else {
          self.showToast(result.message, 'error');
          activateBtn.innerHTML = '<i class="bi bi-check-circle"></i> AKTIVASI LISENSI';
          activateBtn.disabled = false;
          licenseInput.focus();
      }
  }, 800);
};

OfflineLicenseSystem.prototype.setupPackagePreview = function() {
  var self = this;
  var licenseInput = document.getElementById('offlineLicenseKey');
  
  if (!licenseInput) return;
  
  licenseInput.addEventListener('input', function(e) {
      var key = e.target.value.toUpperCase().trim();
      self.updatePackagePreview(key);
  });
};

// ==================== FUNGSI BARU: TOGGLE FOCUSED INPUT MODE ====================
OfflineLicenseSystem.prototype.toggleFocusedInputMode = function(enable, overlay) {
    var popup = overlay.querySelector('.offline-license-popup');
    var licenseInput = overlay.querySelector('#offlineLicenseKey');
    var inputGroup = overlay.querySelector('.input-group');
    var packagePreview = overlay.querySelector('#packagePreview');
    
    if (!popup || !inputGroup) return;
    
    var self = this; // Simpan referensi this
    
    if (enable) {
        // Masuk ke mode fokus
        popup.classList.add('focused-input-mode');
        
        // Tampilkan preview jika ada konten
        if (packagePreview && packagePreview.innerHTML.trim()) {
            packagePreview.style.display = 'block';
            packagePreview.style.visibility = 'visible';
            packagePreview.style.opacity = '1';
        }
        
        // Buat tombol close
        var closeBtn = document.createElement('button');
        closeBtn.className = 'close-focused-btn';
        closeBtn.innerHTML = '<i class="bi bi-x-lg"></i>';
        closeBtn.addEventListener('click', function() {
            self.toggleFocusedInputMode(false, overlay); // Gunakan self
        });
        
        popup.appendChild(closeBtn);
        
        // Buat tombol validasi di dalam input
        var validationIcons = document.createElement('div');
        validationIcons.className = 'input-validation-icons';
        
        var validIcon = document.createElement('button');
        validIcon.className = 'validation-icon valid disabled';
        validIcon.innerHTML = '<i class="bi bi-check-lg"></i>';
        validIcon.title = 'Kode valid - Klik untuk aktivasi';
        validIcon.addEventListener('click', function() {
            if (!validIcon.classList.contains('disabled')) {
                self.processActivation(overlay, overlay.querySelector('#activateOfflineBtn'), licenseInput);
            }
        });
        
        var invalidIcon = document.createElement('button');
        invalidIcon.className = 'validation-icon invalid disabled';
        invalidIcon.innerHTML = '<i class="bi bi-x-lg"></i>';
        invalidIcon.title = 'Kode tidak valid';
        invalidIcon.addEventListener('click', function() {
            self.showToast('Kode lisensi tidak valid', 'error');
            licenseInput.focus();
        });
        
        validationIcons.appendChild(validIcon);
        validationIcons.appendChild(invalidIcon);
        inputGroup.appendChild(validationIcons);
        
        // Setup real-time validation
        self.setupRealTimeValidation(licenseInput, validIcon, invalidIcon); // Gunakan self
        
        // Update preview berdasarkan nilai saat ini
        if (licenseInput.value) {
            licenseInput.dispatchEvent(new Event('input'));
        }
        
        // Fokuskan input
        setTimeout(function() {
            licenseInput.focus();
            licenseInput.select();
        }, 300);
        
    } else {
        // Keluar dari mode fokus
        popup.classList.remove('focused-input-mode');
        
        // Hapus tombol close
        var closeBtn = popup.querySelector('.close-focused-btn');
        if (closeBtn) {
            closeBtn.remove();
        }
        
        // Hapus tombol validasi
        var validationIcons = inputGroup.querySelector('.input-validation-icons');
        if (validationIcons) {
            validationIcons.remove();
        }
        
        // Reset fokus
        if (licenseInput) {
            licenseInput.blur();
        }
    }
};

// ==================== FUNGSI BARU: SETUP REAL-TIME VALIDATION ====================
OfflineLicenseSystem.prototype.setupRealTimeValidation = function(licenseInput, validIcon, invalidIcon) {
    var self = this;
    
    licenseInput.addEventListener('input', function() {
        var key = this.value.toUpperCase().trim();
        
        // Reset icons
        validIcon.classList.add('disabled');
        invalidIcon.classList.add('disabled');
        
        // Trigger update package preview
        if (typeof self.updatePackagePreview === 'function') {
            self.updatePackagePreview(key);
        }
        
        if (!key) {
            return;
        }
        
        // Cek format
        if (!self.isValidLicenseFormat(key)) {
            invalidIcon.classList.remove('disabled');
            invalidIcon.classList.add('active');
            validIcon.classList.remove('active');
            return;
        }
        
        // Cek status lisensi
        self.checkLicenseStatus(key, function(statusData) {
            if (statusData) {
                // Cek jika kode sudah aktif di perangkat lain atau expired
                if ((statusData.status === 'active' && statusData.deviceId !== self.deviceId) || 
                    statusData.status === 'expired' || statusData.isExpired) {
                    invalidIcon.classList.remove('disabled');
                    invalidIcon.classList.add('active');
                    validIcon.classList.remove('active');
                    return;
                }
            }
            
            // Cek apakah kode valid
            var licenseInfo = self.validLicenseKeys[key];
            
            if (licenseInfo) {
                validIcon.classList.remove('disabled');
                validIcon.classList.add('active');
                invalidIcon.classList.remove('active');
            } else {
                invalidIcon.classList.remove('disabled');
                invalidIcon.classList.add('active');
                validIcon.classList.remove('active');
            }
        });
    });
    
    // Juga cek saat ini
    if (licenseInput.value) {
        licenseInput.dispatchEvent(new Event('input'));
    }
};

// ==================== FUNGSI BARU: UPDATE PACKAGE PREVIEW ====================
OfflineLicenseSystem.prototype.updatePackagePreview = function(key) {
    var packagePreview = document.getElementById('packagePreview');
    if (!packagePreview) return;
    
    if (!key) {
        packagePreview.innerHTML = [
            '<div class="preview-placeholder">',
            '    <i class="bi bi-box"></i>',
            '    <p>Paket akan terdeteksi otomatis</p>',
            '</div>'
        ].join('');
        return;
    }
    
    var licenseInfo = this.validLicenseKeys[key];
    
    // Cek status lisensi dari Firebase atau data lokal
    var self = this;
    
    // Function untuk menampilkan preview berdasarkan status
    function showStatusPreview(status, message, type) {
        var icon = '';
        var colorClass = '';
        
        if (type === 'active-used') {
            icon = 'bi-exclamation-triangle';
            colorClass = 'package-used';
        } else if (type === 'expired') {
            icon = 'bi-calendar-x';
            colorClass = 'package-expired';
        }
        
        packagePreview.innerHTML = [
            '<div class="package-status ' + colorClass + '">',
            '    <div class="package-icon">',
            '        <i class="bi ' + icon + '"></i>',
            '    </div>',
            '    <div class="package-info">',
            '        <h4>' + status + '</h4>',
            '        <p>' + message + '</p>',
            '        <div class="package-warning">',
            '            <i class="bi bi-exclamation-circle"></i>',
            '            <span>Kode ini tidak dapat digunakan</span>',
            '        </div>',
            '    </div>',
            '</div>'
        ].join('');
    }
    
    if (licenseInfo) {
        // Cek status dari Firebase atau data lokal
        this.checkLicenseStatus(key, function(statusData) {
            if (statusData) {
                if (statusData.status === 'active' && statusData.deviceId !== self.deviceId) {
                    // Kode aktif di perangkat lain
                    var expiryDate = new Date(statusData.expiryDate || Date.now() + 365 * 24 * 60 * 60 * 1000);
                    showStatusPreview(
                        'Kode Sedang Aktif',
                        'Kode Lisensi telah dipakai pada perangkat lain<br>Device ID: ' + (statusData.deviceId || 'Unknown'),
                        'active-used'
                    );
                } else if (statusData.status === 'expired' || statusData.isExpired) {
                    // Kode kadaluarsa
                    var expiryDate = new Date(statusData.expiryDate || Date.now());
                    showStatusPreview(
                        'Kode Kadaluarsa',
                        'Kode Lisensi telah Kadaluarsa pada tanggal ' + expiryDate.toLocaleDateString('id-ID'),
                        'expired'
                    );
                } else {
                    // Kode valid dan dapat digunakan
                    var packageData = self.licensePackages[licenseInfo.package];
                    
                    packagePreview.innerHTML = [
                        '<div class="package-detected ' + licenseInfo.package + '">',
                        '    <div class="package-icon">',
                        '        <i class="bi bi-shield-check"></i>',
                        '    </div>',
                        '    <div class="package-info">',
                        '        <h4>' + packageData.name + '</h4>',
                        '        <p>' + licenseInfo.expiryDays + ' hari aktif</p>',
                        '        <div class="package-features">',
                        '            <span><i class="bi bi-images"></i> ' + packageData.features.maxImages + ' gambar</span>',
                        '            <span><i class="bi ' + (packageData.features.hiddenAudio.length === 0 ? 'bi-check-lg' : 'bi-x-lg') + '"></i> Audio</span>',
                        '            <span><i class="bi ' + (packageData.features.ads.enabled ? 'bi-x-lg' : 'bi-check-lg') + '"></i> Iklan</span>',
                        '        </div>',
                        '    </div>',
                        '</div>'
                    ].join('');
                }
            } else {
                // Status tidak ditemukan, tampilkan info biasa
                var packageData = this.licensePackages[licenseInfo.package];
                
                packagePreview.innerHTML = [
                    '<div class="package-detected ' + licenseInfo.package + '">',
                    '    <div class="package-icon">',
                    '        <i class="bi bi-shield-check"></i>',
                    '    </div>',
                    '    <div class="package-info">',
                    '        <h4>' + packageData.name + '</h4>',
                    '        <p>' + licenseInfo.expiryDays + ' hari aktif</p>',
                    '        <div class="package-features">',
                    '            <span><i class="bi bi-images"></i> ' + packageData.features.maxImages + ' gambar</span>',
                    '            <span><i class="bi ' + (packageData.features.hiddenAudio.length === 0 ? 'bi-check-lg' : 'bi-x-lg') + '"></i> Audio</span>',
                    '            <span><i class="bi ' + (packageData.features.ads.enabled ? 'bi-x-lg' : 'bi-check-lg') + '"></i> Iklan</span>',
                    '        </div>',
                    '    </div>',
                '</div>'
                ].join('');
            }
        }.bind(this));
    } else {
        // Cek apakah kode ada di Firebase dengan status tertentu
        this.checkLicenseStatus(key, function(statusData) {
            if (statusData) {
                if (statusData.status === 'active' && statusData.deviceId !== self.deviceId) {
                    var expiryDate = new Date(statusData.expiryDate || Date.now() + 365 * 24 * 60 * 60 * 1000);
                    showStatusPreview(
                        'Kode Sedang Aktif',
                        'Kode Lisensi telah dipakai pada perangkat lain<br>Device ID: ' + (statusData.deviceId || 'Unknown'),
                        'active-used'
                    );
                } else if (statusData.status === 'expired' || statusData.isExpired) {
                    var expiryDate = new Date(statusData.expiryDate || Date.now());
                    showStatusPreview(
                        'Kode Kadaluarsa',
                        'Kode Lisensi telah Kadaluarsa pada tanggal ' + expiryDate.toLocaleDateString('id-ID'),
                        'expired'
                    );
                } else {
                    // Kode tidak valid
                    if (self.isValidLicenseFormat(key)) {
                        packagePreview.innerHTML = [
                            '<div class="package-invalid">',
                            '    <div class="package-icon">',
                            '        <i class="bi bi-exclamation-circle"></i>',
                            '    </div>',
                            '    <div class="package-info">',
                            '        <h4>Kode Tidak Dikenali</h4>',
                            '        <p>Kode lisensi tidak ditemukan dalam database</p>',
                            '    </div>',
                        '</div>'
                        ].join('');
                    } else {
                        packagePreview.innerHTML = [
                            '<div class="preview-placeholder">',
                            '    <i class="bi bi-key"></i>',
                            '    <p>Masukkan kode lisensi yang valid</p>',
                            '</div>'
                        ].join('');
                    }
                }
            } else {
                // Kode tidak valid
                if (self.isValidLicenseFormat(key)) {
                    packagePreview.innerHTML = [
                        '<div class="package-invalid">',
                        '    <div class="package-icon">',
                        '        <i class="bi bi-exclamation-circle"></i>',
                        '    </div>',
                        '    <div class="package-info">',
                        '        <h4>Kode Tidak Dikenali</h4>',
                        '        <p>Kode lisensi tidak ditemukan dalam database</p>',
                        '    </div>',
                    '</div>'
                    ].join('');
                } else {
                    packagePreview.innerHTML = [
                        '<div class="preview-placeholder">',
                        '    <i class="bi bi-key"></i>',
                        '    <p>Masukkan kode lisensi yang valid</p>',
                        '</div>'
                    ].join('');
                }
            }
        });
    }
  };

// ==================== FUNGSI DEMO ====================
OfflineLicenseSystem.prototype.checkDemoEligibility = function() {
  // Cek apakah sudah pernah menggunakan demo di perangkat ini
  var demoUsed = localStorage.getItem(this.demoUsedKey);
  
  if (demoUsed === 'true') {
      return {
          eligible: false,
          message: 'Mode demo sudah pernah digunakan pada perangkat ini'
      };
  }
  
  // Cek apakah sudah memiliki lisensi aktif
  if (this.currentLicense && this.currentLicense.status !== 'demo') {
      return {
          eligible: false,
          message: 'Lisensi sudah aktif'
      };
  }
  
  return {
      eligible: true,
      message: 'Dapat menggunakan demo'
  };
};

OfflineLicenseSystem.prototype.activateDemoMode = function() {
  var eligibility = this.checkDemoEligibility();
  if (!eligibility.eligible) {
      this.showToast(eligibility.message, 'error');
      return false;
  }
  
  // TANDAI SUDAH PAKAI DEMO
  localStorage.setItem(this.demoUsedKey, 'true');
  
  var startDate = new Date();
  var expiryDate = new Date();
  expiryDate.setMinutes(startDate.getMinutes() + 15);
  
  this.currentLicense = {
      key: 'DEMO-MODE',
      package: 'demo',
      startDate: startDate.toISOString(),
      expiry: expiryDate.toISOString(),
      deviceId: this.deviceId,
      activatedAt: new Date().toISOString(),
      status: 'demo'
  };
  
  this.saveLicense();
  this.applyDemoFeatures();
  
  var self = this;
  setTimeout(function() {
      self.showExpiredPopup();
  }, 15 * 60 * 1000);
  
  this.showToast('Mode demo aktif selama 15 menit - Semua fitur terbuka', 'info');
  return true;
};

// ==================== TAMBAHKAN FUNGSI BARU: applyDemoFeatures ====================
OfflineLicenseSystem.prototype.applyDemoFeatures = function() {
  console.log('Menerapkan semua fitur untuk mode demo');
  
  // 1. Tampilkan logo jika sebelumnya tersembunyi
  this.showElement('#masjidLogo');
  
  // 2. Tampilkan semua slide
  for (var i = 1; i <= 4; i++) {
      this.showElement('#slide' + i);
  }
  
  // 3. Tampilkan tombol ON/OFF
  this.showElement('#screenOffBtn');
  
  // 4. Tampilkan nama desa lengkap (jika ada)
  this.restoreAddress();
  
  // 5. Batalkan pembatasan gambar (gunakan maksimal 7 gambar seperti VIP)
  this.limitImages(7);
  
  // 6. Tampilkan card Imsak dan Syuruq
  this.showElement('#timeImsak');
  this.showElement('#timeSyuruq');
  this.showElement('#thSyuruq');
  
  // 7. Nonaktifkan timer Maghrib & Isya (tampilkan terus)
  this.showElement('#timeMaghrib');
  this.showElement('#timeIsya');
  
  // 8. Tampilkan semua tombol pengaturan
  this.showAllSettingsButtons();
  
  // 9. Tampilkan semua tombol atur waktu adzan
  this.showAllAdzanButtons();
  
  // 10. Aktifkan semua audio
  this.enableAllAudio();
  
  // 11. Matikan iklan selama demo
  if (this.adsTimer) {
      clearInterval(this.adsTimer);
      this.adsTimer = null;
  }
  
  // Update UI dengan info demo
  this.updateDemoUI();
};

// ==================== TAMBAHKAN FUNGSI HELPER BARU ====================
OfflineLicenseSystem.prototype.showElement = function(selector) {
  var element = document.querySelector(selector);
  if (element) {
      element.style.display = '';
  }
};

OfflineLicenseSystem.prototype.restoreAddress = function() {
  var addressElement = document.getElementById('masjidAddress');
  if (addressElement) {
      // Kembalikan alamat asli atau default
      addressElement.textContent = addressElement.getAttribute('data-original-address') || 'Masjid Al-Muthmainnah';
  }
};

OfflineLicenseSystem.prototype.showAllSettingsButtons = function() {
  var selectors = [
      'button[data-bs-target="#offcanvasDataMasjid"]',
      'button[data-bs-target="#offcanvasRunningText"]',
      'button[onclick="showSliderSettingsForm()"]'
  ];
  
  for (var i = 0; i < selectors.length; i++) {
      this.showElement(selectors[i]);
  }
};

OfflineLicenseSystem.prototype.showAllAdzanButtons = function() {
  var self = this;
  setTimeout(function() {
      var modal = document.getElementById('prayerSettingsModal');
      if (modal) {
          var buttonSelectors = [
              'button[onclick*="adzan"]',
              'button[onclick*="iqamah"]',
              'button[onclick*="overlay"]'
          ];
          
          for (var i = 0; i < buttonSelectors.length; i++) {
              var buttons = modal.querySelectorAll(buttonSelectors[i]);
              for (var j = 0; j < buttons.length; j++) {
                  buttons[j].style.display = '';
              }
          }
      }
  }, 1000);
};

OfflineLicenseSystem.prototype.enableAllAudio = function() {
  var audioIds = ['audioShalawat', 'audioAdzan'];
  
  for (var i = 0; i < audioIds.length; i++) {
      var audioElement = document.getElementById(audioIds[i]);
      if (audioElement) {
          // Setel kembali sumber audio default jika ada
          if (audioIds[i] === 'audioShalawat') {
              audioElement.src = 'audio/shalawat.mp3';
          } else if (audioIds[i] === 'audioAdzan') {
              audioElement.src = 'audio/adzan.mp3';
          }
      }
  }
};

OfflineLicenseSystem.prototype.updateDemoUI = function() {
  // Update badge demo
  var oldBadge = document.getElementById('licenseInfoBadge');
  if (oldBadge && oldBadge.parentNode) {
      oldBadge.parentNode.removeChild(oldBadge);
  }
  
  // Buat badge demo khusus
  var demoBadge = document.createElement('div');
  demoBadge.id = 'licenseInfoBadge';
  demoBadge.style.cssText = [
      'position: fixed;',
      'bottom: 0px;',
      'right: 0px;',
      'background: #333;',
      'color: white;',
      'padding: 8px 15px;',
      'border-radius: 20px 0px 0px 20px;',
      'z-index: 9998;',
      'font-size: 12px;',
      'cursor: pointer;',
      'display: flex;',
      'align-items: center;',
      'gap: 8px;',
  ].join('');
  
  demoBadge.innerHTML = [
      '<i class="bi bi-play-circle" style="font-size: 14px;"></i>',
      '<span><b>DEMO</b></span>'
  ].join('');
  
  document.body.appendChild(demoBadge);
  
  var self = this;
  demoBadge.addEventListener('click', function() {
      self.showDemoInfoPopup();
  });
};

// ==================== TAMBAHKAN FUNGSI SHOW DEMO INFO ====================
OfflineLicenseSystem.prototype.showDemoInfoPopup = function() {
  this.removeExistingPopup();
  
  var overlay = this.createOverlay();
  
  overlay.innerHTML = [
      '<div class="offline-license-popup">',
      '    <div class="popup-header">',
      '        <h2>MODE DEMO AKTIF</h2>',
      '        <p class="subtitle">Semua fitur terbuka selama 15 menit</p>',
      '    </div>',
      '    ',
      '    <div class="popup-body">',
      '        <div class="license-details-card">',
      '            <div class="status-indicator active">',
      '                <div class="status-dot"></div>',
      '                <span>STATUS: MODE DEMO</span>',
      '            </div>',
      '            ',
      '            <div class="demo-features">',
      '                <h4><i class="bi bi-stars"></i> Fitur yang Aktif:</h4>',
      '                <ul>',
      '                    <li class="feature-active">',
      '                        <i class="bi bi-images"></i> Slide Gambar: 7 gambar maksimal',
      '                    </li>',
      '                    <li class="feature-active">',
      '                        <i class="bi bi-music-note-beamed"></i> Audio: Lengkap (Shalawat & Adzan)',
      '                    </li>',
      '                    <li class="feature-active">',
      '                        <i class="bi bi-megaphone"></i> Iklan: Tidak ada iklan',
      '                    </li>',
      '                    <li class="feature-active">',
      '                        <i class="bi bi-sliders"></i> Pengaturan: Semua tombol tersedia',
      '                    </li>',
      '                    <li class="feature-active">',
      '                        <i class="bi bi-clock"></i> Waktu Adzan: Semua pengaturan terbuka',
      '                    </li>',
      '                    <li class="feature-active">',
      '                        <i class="bi bi-display"></i> Semua Slide: Terbuka lengkap',
      '                    </li>',
      '                </ul>',
      '            </div>',
      '            ',
      '            <div class="demo-warning">',
      '                <h4><i class="bi bi-exclamation-triangle"></i> Perhatian:</h4>',
      '                <p>Mode demo akan berakhir dalam 15 menit. Setelah itu, Anda perlu mengaktifkan lisensi untuk melanjutkan penggunaan.</p>',
      '            </div>',
      '            ',
      '            <div class="action-buttons">',
      '                <button id="activateNowBtn" class="btn-activate-large">',
      '                    <i class="bi bi-key-fill"></i> AKTIVASI LISENSI SEKARANG',
      '                </button>',
      '                <button id="closeDemoInfoBtn" class="btn-close">',
      '                    <i class="bi bi-check-lg"></i> LANJUTKAN DEMO',
      '                </button>',
      '            </div>',
      '        </div>',
      '    </div>',
      '    ',
      '    <div class="popup-footer">',
      '        <div class="demo-timer">',
      '            <i class="bi bi-clock"></i>',
      '            <span>Waktu tersisa: <span id="demoTimeRemaining">15:00</span></span>',
      '        </div>',
      '    </div>',
      '</div>'
  ].join('');
  
  document.body.appendChild(overlay);
  
  var self = this;
  
  // Hitung waktu tersisa
  var expiryDate = new Date(this.currentLicense.expiry);
  var now = new Date();
  var timeRemaining = Math.floor((expiryDate - now) / 1000); // dalam detik
  
  function updateTimer() {
      var minutes = Math.floor(timeRemaining / 60);
      var seconds = timeRemaining % 60;
      var timeString = minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
      
      var timerElement = document.getElementById('demoTimeRemaining');
      if (timerElement) {
          timerElement.textContent = timeString;
      }
      
      if (timeRemaining <= 0) {
          clearInterval(timerInterval);
          self.showExpiredPopup();
      }
      
      timeRemaining--;
  }
  
  var timerInterval = setInterval(updateTimer, 1000);
  updateTimer(); // Panggil sekali untuk inisialisasi
  
  document.getElementById('activateNowBtn').addEventListener('click', function() {
      clearInterval(timerInterval);
      self.removePopup(overlay);
      self.showActivationPopup();
  });
  
  document.getElementById('closeDemoInfoBtn').addEventListener('click', function() {
      clearInterval(timerInterval);
      self.removePopup(overlay);
  });
};

OfflineLicenseSystem.prototype.getDeviceId = function() {
  var deviceId = localStorage.getItem('adzan_device_id');
  if (!deviceId) {
      var timestamp = Date.now().toString(36);
      var random = Math.random().toString(36).substr(2, 6);
      deviceId = 'DEV-' + timestamp + '-' + random;
      deviceId = deviceId.toUpperCase();
      localStorage.setItem('adzan_device_id', deviceId);
  }
  return deviceId;
};

// ==================== UTILITY FUNCTIONS ====================
OfflineLicenseSystem.prototype.updateLicenseUI = function() {
  if (!this.currentLicense) return;
  
  var packageData = this.licensePackages[this.currentLicense.package];
  var endDate = new Date(this.currentLicense.expiry);
  var daysLeft = Math.ceil((endDate - new Date()) / (1000 * 3600 * 24));
  
  var packageElement = document.getElementById('licensePackage');
  var statusElement = document.getElementById('licenseStatusText');
  var expiryElement = document.getElementById('licenseExpiryDate');
  var daysLeftElement = document.getElementById('licenseDaysLeft');
  
  if (packageElement) {
      packageElement.textContent = packageData.name;
  }
  
  if (statusElement) {
      if (daysLeft > 7) {
          statusElement.className = 'badge bg-success';
          statusElement.textContent = 'Aktif';
      } else if (daysLeft > 0) {
          statusElement.className = 'badge bg-warning';
          statusElement.textContent = 'Hampir Habis';
      } else {
          statusElement.className = 'badge bg-danger';
          statusElement.textContent = 'Kadaluarsa';
      }
  }
  
  if (expiryElement) {
      expiryElement.textContent = endDate.toLocaleDateString('id-ID');
  }
  
  if (daysLeftElement) {
      daysLeftElement.textContent = daysLeft > 0 ? daysLeft : 0;
  }
};

OfflineLicenseSystem.prototype.removePopup = function(overlay) {
  if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
  }
  this.restoreBackground();
};

OfflineLicenseSystem.prototype.darkenBackground = function() {
  var elements = document.querySelectorAll('body > *:not(#offlineLicenseOverlay)');
  for (var i = 0; i < elements.length; i++) {
      elements[i].style.filter = 'brightness(0.3) blur(2px)';
      elements[i].style.pointerEvents = 'none';
  }
};

OfflineLicenseSystem.prototype.restoreBackground = function() {
  var elements = document.querySelectorAll('body > *:not(#offlineLicenseOverlay)');
  for (var i = 0; i < elements.length; i++) {
      elements[i].style.filter = '';
      elements[i].style.pointerEvents = '';
  }
};

OfflineLicenseSystem.prototype.disableAppInteractions = function() {
  var elements = document.querySelectorAll('body > *:not(#offlineLicenseOverlay)');
  for (var i = 0; i < elements.length; i++) {
      elements[i].style.pointerEvents = 'none';
      elements[i].style.opacity = '0.2';
      elements[i].style.filter = 'blur(3px)';
  }
};

OfflineLicenseSystem.prototype.retryFailedFirebaseSync = function() {
    var failedQueue = JSON.parse(localStorage.getItem('firebase_failed_queue') || '[]');
    
    if (failedQueue.length === 0) {
        console.log('No failed syncs to retry');
        return;
    }
    
    if (!this.initializeFirebase()) {
        console.warn('Firebase not available for retry');
        return;
    }
    
    console.log('Retrying', failedQueue.length, 'failed syncs...');
    
    var successCount = 0;
    var remainingQueue = [];
    
    failedQueue.forEach(function(item) {
        try {
            this.database.ref('licenses/' + item.code).set(item.data)
                .then(function() {
                    console.log('Retry success for:', item.code);
                    successCount++;
                })
                .catch(function(error) {
                    console.warn('Retry failed for:', item.code, error);
                    remainingQueue.push(item);
                });
        } catch (error) {
            console.warn('Exception during retry:', error);
            remainingQueue.push(item);
        }
    }.bind(this));
    
    // Simpan queue yang belum berhasil
    localStorage.setItem('firebase_failed_queue', JSON.stringify(remainingQueue));
    
    if (successCount > 0) {
        this.showToast(successCount + ' syncs retried successfully', 'success');
    }
};

// ==================== FUNGSI BARU: ADJUST POPUP HEIGHT ====================
OfflineLicenseSystem.prototype.adjustPopupHeight = function() {
  var popup = document.querySelector('.offline-license-popup');
  if (!popup) return;
  
  var viewportHeight = window.innerHeight;
  var popupHeight = popup.offsetHeight;
  var maxHeight = viewportHeight * 0.9;
  
  if (popupHeight > maxHeight) {
      popup.style.maxHeight = maxHeight + 'px';
      
      var body = popup.querySelector('.popup-body');
      if (body) {
          var header = popup.querySelector('.popup-header');
          var footer = popup.querySelector('.popup-footer');
          var headerHeight = header ? header.offsetHeight : 0;
          var footerHeight = footer ? footer.offsetHeight : 0;
          
          body.style.maxHeight = (maxHeight - headerHeight - footerHeight - 40) + 'px';
          body.style.overflowY = 'auto';
      }
  } else {
      popup.style.maxHeight = 'none';
      
      var body = popup.querySelector('.popup-body');
      if (body) {
          body.style.maxHeight = 'none';
          body.style.overflowY = 'visible';
      }
  }
  
  // Center the popup vertically if it's smaller than viewport
  if (popupHeight < viewportHeight * 0.8) {
      popup.style.marginTop = ((viewportHeight - popupHeight) / 2 - 20) + 'px';
  } else {
      popup.style.marginTop = '20px';
  }
};

// ==================== TOAST NOTIFICATION ====================
OfflineLicenseSystem.prototype.showToast = function(message, type) {
  var oldToast = document.querySelector('.license-toast');
  if (oldToast && oldToast.parentNode) {
      oldToast.parentNode.removeChild(oldToast);
  }
  
  var toast = document.createElement('div');
  toast.className = 'license-toast toast-' + type;
  
  var icon = '';
  if (type === 'success') {
      icon = 'check-circle';
  } else if (type === 'error') {
      icon = 'exclamation-circle';
  } else {
      icon = 'info-circle';
  }
  
  toast.innerHTML = [
      '<i class="bi bi-' + icon + '"></i>',
      '<span>' + message + '</span>'
  ].join('');
  
  document.body.appendChild(toast);
  
  var selfToast = toast;
  setTimeout(function() {
      if (selfToast.parentNode) {
          selfToast.parentNode.removeChild(selfToast);
      }
  }, 4000);
};

// ==================== FUNGSI BARU: SIMPAN VALID LICENSE KEYS ====================
OfflineLicenseSystem.prototype.saveValidLicenseKeys = function() {
  try {
      localStorage.setItem('valid_license_keys', JSON.stringify(this.validLicenseKeys));
      return true;
  } catch (error) {
      console.error('Error saving valid license keys:', error);
      return false;
  }
};

// ==================== FUNGSI BARU: LOAD VALID LICENSE KEYS ====================
OfflineLicenseSystem.prototype.loadValidLicenseKeys = function() {
  try {
      var saved = localStorage.getItem('valid_license_keys');
      if (saved) {
          var loadedKeys = JSON.parse(saved);
          // Gabungkan dengan default keys (jika ada key yang sama, gunakan yang dari localStorage)
          Object.assign(this.validLicenseKeys, loadedKeys);
          console.log('Loaded valid license keys from storage:', Object.keys(loadedKeys).length, 'keys');
      }
  } catch (error) {
      console.error('Error loading valid license keys:', error);
  }
};

// ==================== FUNGSI BARU: CEK STATUS DEMO ====================
OfflineLicenseSystem.prototype.checkDemoStatus = function() {
    var demoUsed = localStorage.getItem(this.demoUsedKey);
    if (demoUsed !== 'true') return false;
    
    // Cek apakah ada lisensi demo yang masih aktif
    if (this.currentLicense && this.currentLicense.package === 'demo') {
        var expiryDate = new Date(this.currentLicense.expiry);
        var now = new Date();
        
        if (now < expiryDate) {
            // Demo masih aktif
            return true;
        } else {
            // Demo sudah expired, hapus status
            this.cleanupExpiredDemo();
            return false;
        }
    }
    
    return false;
};

// ==================== FUNGSI BARU: CLEANUP DEMO EXPIRED ====================
OfflineLicenseSystem.prototype.cleanupExpiredDemo = function() {
    if (this.currentLicense && this.currentLicense.package === 'demo') {
        // Hapus lisensi demo dari localStorage
        localStorage.removeItem('adzan_offline_license');
        localStorage.removeItem('adzanAppLicense');
        
        // Reset current license
        this.currentLicense = null;
        
        // Hentikan iklan jika berjalan
        if (this.adsTimer) {
            clearInterval(this.adsTimer);
            this.adsTimer = null;
        }
    }
};

// ==================== FUNGSI BARU: CEK LISENSI YANG ADA ====================
OfflineLicenseSystem.prototype.checkExistingLicense = function() {
    if (!this.currentLicense) return false;
    
    // Jika ini demo, cek apakah masih aktif
    if (this.currentLicense.package === 'demo') {
        var expiryDate = new Date(this.currentLicense.expiry);
        var now = new Date();
        
        if (now < expiryDate) {
            // Demo masih aktif
            return true;
        } else {
            // Demo expired, hapus
            this.cleanupExpiredDemo();
            return false;
        }
    }
    
    // Untuk lisensi biasa (trial, basic, premium, vip)
    return this.currentLicense.status !== 'demo';
};

// ==================== FUNGSI BARU: SETUP TIMER EXPIRY DEMO ====================
OfflineLicenseSystem.prototype.setupDemoExpiryTimer = function() {
    if (!this.currentLicense || this.currentLicense.package !== 'demo') return;
    
    var expiryDate = new Date(this.currentLicense.expiry);
    var now = new Date();
    var timeRemaining = expiryDate - now;
    
    if (timeRemaining <= 0) {
        // Demo sudah expired
        this.showDemoExpiredPopup();
        return;
    }
    
    var self = this;
    setTimeout(function() {
        self.showDemoExpiredPopup();
    }, timeRemaining);
    
    console.log('Timer demo diset untuk', Math.floor(timeRemaining / 1000 / 60), 'menit lagi');
};

// ==================== FUNGSI BARU: POPUP WELCOME DEMO ====================
OfflineLicenseSystem.prototype.showWelcomeDemoPopup = function() {
    this.removeExistingPopup();
    
    var overlay = this.createOverlay();
    
    overlay.innerHTML = [
        '<div class="offline-license-popup">',
        '    <div class="popup-header" style="background: linear-gradient(135deg, #6f42c1 0%, #6610f2 100%);">',
        '        <div class="header-icon">',
        '            <i class="bi bi-play-circle"></i>',
        '        </div>',
        '        <h2>PAKET DEMO AKTIF</h2>',
        '        <p class="subtitle">15 Menit Akses Penuh</p>',
        '    </div>',
        '    ',
        '    <div class="popup-body">',
        '        <div class="demo-welcome-card">',
        '            <div class="demo-icon">',
        '                <i class="bi bi-gift"></i>',
        '            </div>',
        '            ',
        '            <h3 class="text-center mb-4">Selamat Datang di Mahallah TV</h3>',
        '            ',
        '            <div class="demo-message">',
        '                <p>Anda sedang menggunakan <strong>Paket Demo Gratis</strong> dengan batasan:</p>',
        '                <ul class="demo-features-list">',
        '                    <li><i class="bi bi-check-circle"></i> 15 menit akses penuh</li>',
        '                    <li><i class="bi bi-x-circle"></i> Iklan akan ditampilkan</li>',
        '                    <li><i class="bi bi-x-circle"></i> Beberapa fitur terbatas</li>',
        '                </ul>',
        '                <p class="demo-note"><i class="bi bi-info-circle"></i> Setelah demo berakhir, silahkan pilih paket yang sesuai</p>',
        '            </div>',
        '            ',
        '            <div class="demo-actions">',
        '                <button id="upgradeNowBtn" class="btn-upgrade-now">',
        '                    <i class="bi bi-arrow-up-circle"></i> UPGRADE SEKARANG',
        '                </button>',
        '                <button id="continueDemoBtn" class="btn-demo-mode">',
        '                    <i class="bi bi-play-fill"></i> LANJUTKAN DEMO',
        '                </button>',
        '            </div>',
        '            ',
        '            <div class="demo-timer-info">',
        '                <p><i class="bi bi-clock"></i> Waktu demo akan dimulai setelah Anda klik "Lanjutkan Demo"</p>',
        '            </div>',
        '        </div>',
        '    </div>',
        '</div>'
    ].join('');
    
    document.body.appendChild(overlay);
    this.darkenBackground();
    
    var self = this;
    
    // Event listener untuk upgrade
    document.getElementById('upgradeNowBtn').addEventListener('click', function() {
        self.removePopup(overlay);
        self.showPackageSelectionPopup();
    });
    
    // Event listener untuk lanjut demo
    document.getElementById('continueDemoBtn').addEventListener('click', function() {
        self.removePopup(overlay);
        self.startDemoMode();
    });
};

// ==================== FUNGSI BARU: TAMPILKAN PILIHAN PAKET ====================
OfflineLicenseSystem.prototype.showPackageSelectionPopup = function() {
    this.removeExistingPopup();
    
    var overlay = this.createOverlay();
    
    overlay.innerHTML = [
        '<div class="offline-license-popup upgrade">',
        '    <div class="popup-header">',
        '        <h2>PILIH PAKET LISENSI</h2>',
        '        <p class="subtitle">Pilih paket yang sesuai dengan kebutuhan Anda</p>',
        '    </div>',
        '    ',
        '    <div class="popup-body">',
        '        <div class="packages-grid">',
        '            <div class="package-card free">',
        '                <div class="package-badge">GRATIS</div>',
        '                <h4>Free Trial</h4>',
        '                <div class="package-duration">2 Hari</div>',
        '                <ul class="package-features">',
        '                    <li><i class="bi bi-check-circle"></i> Iklan terbatas</li>',
        '                    <li><i class="bi bi-check-circle"></i> 2 gambar maksimal</li>',
        '                    <li><i class="bi bi-x-circle"></i> Audio terbatas</li>',
        '                    <li><i class="bi bi-x-circle"></i> Slide terbatas</li>',
        '                </ul>',
        '                <button onclick="offlineLicense.selectPackage(\'trial\')" class="btn-package-select free">',
        '                    <i class="bi bi-check-circle"></i> PAKET FREE',
        '                </button>',
        '            </div>',
        '            ',
        '            <div class="package-card basic">',
        '                <h4>Dasar</h4>',
        '                <div class="package-price">Rp 340.000</div>',
        '                <div class="package-duration">1 Tahun</div>',
        '                <ul class="package-features">',
        '                    <li><i class="bi bi-check-circle"></i> Iklan minimal</li>',
        '                    <li><i class="bi bi-check-circle"></i> 2 gambar maksimal</li>',
        '                    <li><i class="bi bi-check-circle"></i> Audio lengkap</li>',
        '                    <li><i class="bi bi-check-circle"></i> Semua slide terbuka</li>',
        '                </ul>',
        '                <button onclick="offlineLicense.selectPackage(\'basic\')" class="btn-package-select basic">',
        '                    <i class="bi bi-check-circle"></i> PILIH PAKET',
        '                </button>',
        '            </div>',
        '            ',
        '            <div class="package-card premium">',
        '                <div class="package-badge popular">POPULER</div>',
        '                <h4>Premium</h4>',
        '                <div class="package-price">Rp 570.000</div>',
        '                <div class="package-duration">1 Tahun</div>',
        '                <ul class="package-features">',
        '                    <li><i class="bi bi-check-circle"></i> Tanpa iklan</li>',
        '                    <li><i class="bi bi-check-circle"></i> 5 gambar maksimal</li>',
        '                    <li><i class="bi bi-check-circle"></i> Audio lengkap</li>',
        '                    <li><i class="bi bi-check-circle"></i> Semua fitur terbuka</li>',
        '                </ul>',
        '                <button onclick="offlineLicense.selectPackage(\'premium\')" class="btn-package-select premium">',
        '                    <i class="bi bi-check-circle"></i> PILIH PAKET',
        '                </button>',
        '            </div>',
        '            ',
        '            <div class="package-card vip">',
        '                <div class="package-badge vip">VIP</div>',
        '                <h4>VIP</h4>',
        '                <div class="package-price">Rp 1.420.000</div>',
        '                <div class="package-duration">Seumur Hidup</div>',
        '                <ul class="package-features">',
        '                    <li><i class="bi bi-check-circle"></i> Tanpa iklan</li>',
        '                    <li><i class="bi bi-check-circle"></i> 7 gambar maksimal</li>',
        '                    <li><i class="bi bi-check-circle"></i> Semua fitur premium</li>',
        '                    <li><i class="bi bi-check-circle"></i> + STB & Kabel HDMI</li>',
        '                </ul>',
        '                <button onclick="offlineLicense.selectPackage(\'vip\')" class="btn-package-select vip">',
        '                    <i class="bi bi-check-circle"></i> PILIH PAKET',
        '                </button>',
        '            </div>',
        '        </div>',
        '        ',
        '        <div class="package-back">',
        '            <button id="backToDemoBtn" class="btn-back">',
        '                <i class="bi bi-arrow-left"></i> Kembali ke Demo',
        '            </button>',
        '        </div>',
        '    </div>',
        '</div>'
    ].join('');
    
    document.body.appendChild(overlay);
    this.darkenBackground();
    
    var self = this;
    
    // Event listener untuk kembali ke demo
    document.getElementById('backToDemoBtn').addEventListener('click', function() {
        self.removePopup(overlay);
        self.showWelcomeDemoPopup();
    });
};

// ==================== FUNGSI BARU: PILIH PAKET ====================
OfflineLicenseSystem.prototype.selectPackage = function(packageType) {
    if (packageType === 'trial') {
        // Langsung aktifkan trial 2 hari
        this.activateTrialMode();
    } else {
        // Untuk paket berbayar, tampilkan popup aktivasi
        this.removeExistingPopup();
        this.showActivationPopup();
    }
};

// ==================== FUNGSI BARU: AKTIFKAN TRIAL ====================
OfflineLicenseSystem.prototype.activateTrialMode = function() {
    var startDate = new Date();
    var expiryDate = new Date();
    expiryDate.setDate(startDate.getDate() + 2); // 2 hari
    
    this.currentLicense = {
        key: 'TRIAL-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        package: 'trial',
        startDate: startDate.toISOString(),
        expiry: expiryDate.toISOString(),
        deviceId: this.deviceId,
        activatedAt: new Date().toISOString(),
        status: 'active'
    };
    
    this.saveLicense();
    this.applyLicenseFeatures();
    this.showBriefLicenseInfo();
    
    this.showToast('Paket Trial 2 hari berhasil diaktifkan!', 'success');
    
    // Simpan ke Firebase jika ada koneksi
    if (this.initializeFirebase()) {
        this.saveLicenseToFirebase(this.currentLicense);
    }
};

// ==================== FUNGSI BARU: MULAI DEMO MODE ====================
OfflineLicenseSystem.prototype.startDemoMode = function() {
    // Tandai demo sudah digunakan
    localStorage.setItem(this.demoUsedKey, 'true');
    
    var startDate = new Date();
    var expiryDate = new Date();
    expiryDate.setMinutes(startDate.getMinutes() + 15); // 15 menit
    
    this.currentLicense = {
        key: 'DEMO-MODE-' + Date.now(),
        package: 'demo',
        startDate: startDate.toISOString(),
        expiry: expiryDate.toISOString(),
        deviceId: this.deviceId,
        activatedAt: new Date().toISOString(),
        status: 'active'
    };
    
    this.saveLicense();
    this.applyDemoFeatures();
    this.showDemoBriefInfo();
    this.setupDemoExpiryTimer();
    
    this.showToast('Mode demo aktif selama 15 menit!', 'info');
};

// ==================== FUNGSI BARU: POPUP DEMO EXPIRED ====================
OfflineLicenseSystem.prototype.showDemoExpiredPopup = function() {
    this.removeExistingPopup();
    
    var overlay = this.createOverlay();
    
    overlay.innerHTML = [
        '<div class="offline-license-popup expired">',
        '    <div class="popup-header expired">',
        '        <h2>DEMO BERAKHIR</h2>',
        '        <p class="subtitle">Demo aplikasi Mahallah TV telah berakhir</p>',
        '    </div>',
        '    ',
        '    <div class="popup-body">',
        '        <div class="demo-expired-message">',
        '            ',
        '            <h3 class="text-center mb-4">Waktu Demo Telah Habis</h3>',
        '            <p class="text-center mb-4">Silahkan pilih paket untuk melanjutkan penggunaan:</p>',
        '            ',
        '            <div class="packages-grid-expired">',
        '                <div class="package-card-expired free">',
        '                    <h5>Free Trial</h5>',
        '                    <div class="duration">2 Hari</div>',
        '                    <ul>',
        '                        <li>Iklan terbatas</li>',
        '                        <li>2 gambar maksimal</li>',
        '                    </ul>',
        '                    <button onclick="offlineLicense.selectPackage(\'trial\')" class="btn-package-select-expired">',
        '                        PAKET FREE',
        '                    </button>',
        '                </div>',
        '                ',
        '                <div class="package-card-expired basic">',
        '                    <h5>Dasar</h5>',
        '                    <div class="price">Rp 340.000</div>',
        '                    <div class="duration">1 Tahun</div>',
        '                    <ul>',
        '                        <li>Iklan minimal</li>',
        '                        <li>Audio lengkap</li>',
        '                    </ul>',
        '                    <button onclick="offlineLicense.selectPackage(\'basic\')" class="btn-package-select-expired">',
        '                        PILIH PAKET',
        '                    </button>',
        '                </div>',
        '                ',
        '                <div class="package-card-expired premium">',
        '                    <h5>Premium</h5>',
        '                    <div class="price">Rp 570.000</div>',
        '                    <div class="duration">1 Tahun</div>',
        '                    <ul>',
        '                        <li>Tanpa iklan</li>',
        '                        <li>5 gambar maksimal</li>',
        '                    </ul>',
        '                    <button onclick="offlineLicense.selectPackage(\'premium\')" class="btn-package-select-expired">',
        '                        PILIH PAKET',
        '                    </button>',
        '                </div>',
        '                ',
        '                <div class="package-card-expired vip">',
        '                    <h5>VIP</h5>',
        '                    <div class="price">Rp 1.420.000</div>',
        '                    <div class="duration">Seumur Hidup</div>',
        '                    <ul>',
        '                        <li>Semua fitur</li>',
        '                        <li>+ STB & Kabel</li>',
        '                    </ul>',
        '                    <button onclick="offlineLicense.selectPackage(\'vip\')" class="btn-package-select-expired">',
        '                        PILIH PAKET',
        '                    </button>',
        '                </div>',
        '            </div>',
        '        </div>',
        '    </div>',
        '</div>'
    ].join('');
    
    document.body.appendChild(overlay);
    this.disableAppInteractions();
};

// ==================== FUNGSI BARU: TAMPILKAN INFO DEMO SINGKAT ====================
OfflineLicenseSystem.prototype.showDemoBriefInfo = function() {
    if (!this.currentLicense || this.currentLicense.package !== 'demo') return;
    
    // Hapus badge lama jika ada
    var oldBadge = document.getElementById('licenseInfoBadge');
    if (oldBadge && oldBadge.parentNode) {
        oldBadge.parentNode.removeChild(oldBadge);
    }
    
    // Buat badge demo
    var demoBadge = document.createElement('div');
    demoBadge.id = 'licenseInfoBadge';
    demoBadge.style.cssText = [
        'position: fixed;',
        'bottom: 0px;',
        'right: 0px;',
        'background: #6f42c1;',
        'color: white;',
        'padding: 8px 15px;',
        'border-radius: 20px 0px 0px 20px;',
        'z-index: 9998;',
        'font-size: 12px;',
        'cursor: pointer;',
        'display: flex;',
        'align-items: center;',
        'gap: 8px;',
        'box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);',
        'transition: all 0.3s;'
    ].join('');
    
    demoBadge.innerHTML = [
        '<i class="bi bi-play-circle" style="font-size: 14px;"></i>',
        '<span><b>DEMO</b> (15 menit)</span>'
    ].join('');
    
    document.body.appendChild(demoBadge);
    
    var self = this;
    demoBadge.addEventListener('click', function() {
        self.showDemoTimeRemainingPopup();
    });
    
    // Hover effect
    demoBadge.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(-5px)';
        this.style.boxShadow = '0 -2px 15px rgba(0, 0, 0, 0.4)';
    });
    
    demoBadge.addEventListener('mouseleave', function() {
        this.style.transform = 'translateX(0)';
        this.style.boxShadow = '0 -2px 10px rgba(0, 0, 0, 0.3)';
    });
};

// ==================== FUNGSI BARU: POPUP WAKTU DEMO TERSISA ====================
OfflineLicenseSystem.prototype.showDemoTimeRemainingPopup = function() {
    if (!this.currentLicense || this.currentLicense.package !== 'demo') return;
    
    this.removeExistingPopup();
    
    var overlay = this.createOverlay();
    var expiryDate = new Date(this.currentLicense.expiry);
    var now = new Date();
    var timeRemaining = Math.floor((expiryDate - now) / 1000); // dalam detik
    
    if (timeRemaining <= 0) {
        this.showDemoExpiredPopup();
        return;
    }
    
    var minutes = Math.floor(timeRemaining / 60);
    var seconds = timeRemaining % 60;
    
    overlay.innerHTML = [
        '<div class="offline-license-popup">',
        '    <div class="popup-header" style="background: #6f42c1;">',
        '        <h2>WAKTU DEMO TERSISA</h2>',
        '        <p class="subtitle">Demo akan berakhir dalam</p>',
        '    </div>',
        '    ',
        '    <div class="popup-body">',
        '        <div class="demo-timer-card">',
        '            <div class="timer-display">',
        '                <div class="timer">' + 
                    minutes.toString().padStart(2, '0') + ':' + 
                    seconds.toString().padStart(2, '0') + 
                '</div>',
        '                <div class="timer-label">MENIT : DETIK</div>',
        '            </div>',
        '            ',
        '            <div class="demo-warning">',
        '                <p><i class="bi bi-exclamation-triangle"></i> Setelah demo berakhir, beberapa fitur akan dibatasi</p>',
        '            </div>',
        '            ',
        '            <div class="demo-upgrade-option">',
        '                <button onclick="offlineLicense.showPackageSelectionPopup()" class="btn-upgrade-now">',
        '                    <i class="bi bi-arrow-up-circle"></i> UPGRADE SEKARANG',
        '                </button>',
        '                <button id="closeDemoTimerBtn" class="btn-close">',
        '                    <i class="bi bi-check-lg"></i> TUTUP',
        '                </button>',
        '            </div>',
        '        </div>',
        '    </div>',
        '</div>'
    ].join('');
    
    document.body.appendChild(overlay);
    this.darkenBackground();
    
    var self = this;
    
    document.getElementById('closeDemoTimerBtn').addEventListener('click', function() {
        self.removePopup(overlay);
    });
    
    // Update timer setiap detik
    var timerElement = overlay.querySelector('.timer');
    var timerInterval = setInterval(function() {
        timeRemaining--;
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            self.removePopup(overlay);
            self.showDemoExpiredPopup();
            return;
        }
        
        var minutes = Math.floor(timeRemaining / 60);
        var seconds = timeRemaining % 60;
        
        if (timerElement) {
            timerElement.textContent = 
                minutes.toString().padStart(2, '0') + ':' + 
                seconds.toString().padStart(2, '0');
        }
    }, 1000);
    
    // Simpan interval untuk di-clear saat popup ditutup
    overlay.timerInterval = timerInterval;
};

// Di bagian akhir file, tambahkan interval untuk cek demo
// Tambahkan di global scope atau di constructor:
OfflineLicenseSystem.prototype.startDemoMonitor = function() {
    var self = this;
    // Cek setiap 30 detik
    setInterval(function() {
        if (self.currentLicense && self.currentLicense.package === 'demo') {
            var expiryDate = new Date(self.currentLicense.expiry);
            var now = new Date();
            
            if (now >= expiryDate) {
                // Demo expired
                self.showDemoExpiredPopup();
            }
        }
    }, 30000); // 30 detik
};

// ==================== STYLING ====================
OfflineLicenseSystem.prototype.addStyles = function() {
  if (document.getElementById('offline-license-styles')) return;
  
  var style = document.createElement('style');
  style.id = 'offline-license-styles';
  
  var css = `
      /* ==================== BASE ANIMATIONS ==================== */
      @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
      }
      
      @keyframes slideUp {
          from { 
              transform: translateY(50px) scale(0.95); 
              opacity: 0; 
          }
          to { 
              transform: translateY(0) scale(1); 
              opacity: 1; 
          }
      }
      
      @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
      }
      
      /* ==================== OVERLAY ==================== */
      #offlineLicenseOverlay {
          z-index: 99999 ;
          overflow-y: auto ;
          align-items: flex-start ;
          padding: 20px ;
          background: rgba(0, 0, 0, 0.92) ;
      }
      
      /* ==================== MAIN POPUP ==================== */
      .offline-license-popup {
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%) ;
          color: #333333 ;
          border-radius: 20px;
          width: 100%;
          max-width: 800px;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
          border: 2px solid #005a31;
          animation: slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          margin: 20px auto ;
          position: relative;
          display: flex;
          flex-direction: column;
      }
      
      /* Admin dan Upgrade popup lebih lebar */
      .offline-license-popup.admin,
      .offline-license-popup.upgrade {
          max-width: 900px ;
      }
      
      /* Expired popup */
      .offline-license-popup.expired {
          border-color: #dc3545;
      }
      
      /* ==================== POPUP HEADER ==================== */
      .popup-header {
          padding: 30px;
          text-align: center;
          background: linear-gradient(135deg, #005a31 0%, #00816d 100%) ;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: white ;
          flex-shrink: 0;
      }
      
      .popup-header.active {
          background: linear-gradient(135deg, #00816d 0%, #005a31 100%) ;
      }
      
      .popup-header.expired {
          background: linear-gradient(135deg, #8b0000 0%, #dc3545 100%) ;
      }
      
      .header-icon {
          font-size: 60px;
          color: white;
          margin-bottom: 15px;
          display: block;
      }
      
      .popup-header h2 {
          margin: 0 0 10px 0;
          font-size: 28px;
          font-weight: 800;
          color: white ;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      }
      
      .subtitle {
          margin: 0;
          color: rgba(255, 255, 255, 0.9) ;
          font-size: 16px;
      }
      
      /* ==================== POPUP BODY (SCROLLABLE) ==================== */
      .popup-body {
          padding: 30px;
          overflow-y: auto;
          overflow-x: hidden;
          flex: 1;
          background: #ffffff ;
          color: #333333 ;
          max-height: 60vh;
      }
      
      /* Untuk admin panel yang lebih panjang */
      .offline-license-popup.admin .popup-body {
          max-height: 65vh ;
      }
      
      /* Custom scrollbar */
      .popup-body::-webkit-scrollbar {
          width: 8px;
      }
      
      .popup-body::-webkit-scrollbar-track {
          background: rgba(0, 90, 49, 0.1);
          border-radius: 4px;
      }
      
      .popup-body::-webkit-scrollbar-thumb {
          background: #005a31;
          border-radius: 4px;
      }
      
      .popup-body::-webkit-scrollbar-thumb:hover {
          background: #00816d;
      }
      
      /* ==================== CARDS ==================== */
      .activation-card,
      .license-details-card,
      .expired-warning-card,
      .admin-panel,
      .upgrade-container {
          background: rgba(255, 255, 255, 0.98) ;
          border-radius: 15px;
          padding: 25px;
          border: 1px solid rgba(0, 90, 49, 0.2);
          color: #333333 ;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
      }

      /* Tambahkan di CSS (func3.txt) */

    /* License Details Styles */
    .license-details-card {
        background: rgba(255, 255, 255, 0.98) ;
        border-radius: 15px;
        padding: 25px;
        border: 1px solid rgba(0, 90, 49, 0.2);
        color: #333333 ;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    }

    .detail-item {
        background: rgba(0, 0, 0, 0.03);
        padding: 15px;
        border-radius: 10px;
        border: 1px solid rgba(0, 90, 49, 0.1);
    }

    .detail-item label {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #005a31 ;
        font-size: 14px;
        margin-bottom: 8px;
        font-weight: 600;
    }

    .detail-value {
        color: #333333 ;
        font-weight: bold;
        font-size: 16px;
    }

    .license-key {
        font-family: 'Courier New', monospace;
        color: #005a31 ;
        background: rgba(0, 90, 49, 0.05);
        padding: 5px 10px;
        border-radius: 5px;
        display: inline-block;
        font-weight: bold;
    }

    .features-list {
        background: rgba(0, 90, 49, 0.03);
        padding: 20px;
        border-radius: 10px;
        margin: 20px 0;
        border: 1px solid rgba(0, 90, 49, 0.1);
    }

    .features-list h4 {
        color: #005a31 ;
        margin-top: 0;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .features-list ul {
        list-style: none;
        padding: 0;
        margin: 15px 0 0 0;
    }

    .features-list li {
        padding: 10px;
        margin-bottom: 8px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        color: #333333 ;
    }

    .feature-active {
        background: rgba(40, 167, 69, 0.1);
        border-left: 4px solid #28a745;
    }

    .feature-inactive {
        background: rgba(220, 53, 69, 0.05);
        border-left: 4px solid #dc3545;
    }

    .action-buttons {
        display: flex;
        gap: 15px;
        margin-top: 20px;
    }

    @media (max-width: 768px) {
        .action-buttons {
            flex-direction: column;
        }
    }
      
      /* ==================== STATUS INDICATOR ==================== */
      .status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          border-radius: 50px;
          background: rgba(0, 0, 0, 0.05);
          margin-bottom: 25px;
          font-weight: bold;
          font-size: 14px;
          color: #333333 ;
      }
      
      .status-indicator.inactive {
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.3);
          color: #dc3545 ;
      }
      
      .status-indicator.active {
          background: rgba(40, 167, 69, 0.1);
          border: 1px solid rgba(40, 167, 69, 0.3);
          color: #28a745 ;
      }
      
      .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse 2s infinite;
      }
      
      /* ==================== LICENSE INPUT ==================== */
      .license-input-section {
          margin-bottom: 30px;
      }
      
      .input-group {
          margin-bottom: 25px;
      }
      
      .input-label {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          color: #005a31 ;
          font-weight: 600;
          font-size: 16px;
      }
      
      .license-input {
          width: 100%;
          padding: 18px 20px;
          font-size: 20px;
          font-weight: bold;
          letter-spacing: 1px;
          background: #ffffff ;
          border: 2px solid #005a31;
          border-radius: 10px;
          color: #333333 ;
          text-align: center;
          text-transform: uppercase;
          font-family: 'Courier New', monospace;
          transition: all 0.3s;
          box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1);
      }
      
      .license-input:focus {
          outline: none;
          border-color: #005a31;
          box-shadow: 0 0 0 4px rgba(0, 90, 49, 0.3), inset 0 2px 5px rgba(0, 0, 0, 0.1);
          background: #ffffff ;
      }
      
      .input-hint {
          margin-top: 8px;
          color: #666666 ;
          font-size: 13px;
          text-align: center;
      }
      
      /* ==================== PACKAGE PREVIEW ==================== */
      .package-preview {
          background: rgba(0, 90, 49, 0.05) ;
          border-radius: 10px;
          padding: 20px;
          min-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333333 ;
          border: 1px dashed rgba(0, 90, 49, 0.3);
      }
      
      .preview-placeholder {
          text-align: center;
          color: #666666 ;
      }
      
      .preview-placeholder i {
          font-size: 40px;
          margin-bottom: 10px;
          display: block;
          color: #999999;
      }
      
      .package-detected {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 15px;
          background: rgba(0, 90, 49, 0.1) ;
          border-radius: 10px;
          border: 1px solid rgba(0, 90, 49, 0.3);
          animation: slideUp 0.3s ease;
          color: #333333 ;
          width: 100%;
      }
      
      .package-detected.trial {
          background: rgba(255, 193, 7, 0.1) ;
          border-color: rgba(255, 193, 7, 0.3);
      }
      
      .package-detected.basic {
          background: rgba(13, 110, 253, 0.1) ;
          border-color: rgba(13, 110, 253, 0.3);
      }
      
      .package-detected.premium {
          background: rgba(111, 66, 193, 0.1) ;
          border-color: rgba(111, 66, 193, 0.3);
      }
      
      .package-detected.vip {
          background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(220, 53, 69, 0.1)) ;
          border-color: rgba(255, 193, 7, 0.3);
      }
      
      .package-icon {
          font-size: 40px;
          color: #005a31;
      }
      
      .package-detected.trial .package-icon { color: #fd7e14; }
      .package-detected.basic .package-icon { color: #0d6efd; }
      .package-detected.premium .package-icon { color: #6f42c1; }
      .package-detected.vip .package-icon { color: #ffc107; }
      
      .package-info h4 {
          margin: 0 0 5px 0;
          font-size: 22px;
          color: #333333 ;
      }
      
      .package-info p {
          margin: 0 0 10px 0;
          color: #666666 ;
      }
      
      .package-features {
          display: flex;
          gap: 15px;
          font-size: 14px;
          flex-wrap: wrap;
      }
      
      .package-features span {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 5px;
          color: #333333;
      }
      
      .package-invalid {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 15px;
          background: rgba(220, 53, 69, 0.1) ;
          border-radius: 10px;
          border: 1px solid rgba(220, 53, 69, 0.3);
          animation: slideUp 0.3s ease;
          color: #333333 ;
          width: 100%;
      }
      
      .package-invalid .package-icon {
          color: #dc3545;
      }
      
      /* ==================== BUTTONS ==================== */
      .action-section {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin: 25px 0;
      }
      
      /* Primary buttons - Green */
      .btn-activate-large,
      .btn-contact,
      .btn-whatsapp,
      .btn-upgrade-now,
      .btn-admin-generate,
      .btn-confirm-upgrade,
      .btn-whatsapp-admin {
          background: linear-gradient(135deg, #005a31 0%, #00816d 100%) ;
          color: white ;
          border: none;
          padding: 18px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          text-decoration: none;
      }
      
      .btn-activate-large:hover,
      .btn-contact:hover,
      .btn-whatsapp:hover,
      .btn-upgrade-now:hover,
      .btn-admin-generate:hover,
      .btn-confirm-upgrade:hover,
      .btn-whatsapp-admin:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0, 90, 49, 0.4);
      }
      
      .btn-activate-large:active,
      .btn-contact:active,
      .btn-whatsapp:active,
      .btn-upgrade-now:active,
      .btn-admin-generate:active,
      .btn-confirm-upgrade:active,
      .btn-whatsapp-admin:active {
          transform: translateY(-1px);
      }
      
      .btn-success-large {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%) ;
      }
      
      /* Secondary buttons - Light */
      .btn-demo-mode,
      .btn-copy,
      .btn-admin-secondary,
      .btn-cancel-upgrade,
      .btn-close,
      .btn-admin-close,
      .btn-copy-admin {
          background: rgba(255, 255, 255, 0.9) ;
          color: #333333 ;
          border: 2px solid #005a31;
          padding: 16px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
      }
      
      .btn-demo-mode:hover,
      .btn-copy:hover,
      .btn-admin-secondary:hover,
      .btn-cancel-upgrade:hover,
      .btn-close:hover,
      .btn-admin-close:hover,
      .btn-copy-admin:hover {
          background: rgba(0, 90, 49, 0.1) ;
          transform: translateY(-2px);
      }
      
      /* Danger buttons - Red */
      .btn-deactivate,
      .btn-admin-danger {
          background: linear-gradient(135deg, #dc3545 0%, #b02a37 100%) ;
          color: white ;
          border: none;
          padding: 18px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
      }
      
      .btn-deactivate:hover,
      .btn-admin-danger:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(220, 53, 69, 0.4);
      }
      
      /* Special buttons */
      .btn-admin-panel {
          background: linear-gradient(135deg, #6f42c1 0%, #6610f2 100%) ;
          color: white ;
          border: none;
          padding: 18px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
      }
      
      .btn-admin-panel:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(111, 66, 193, 0.4);
      }
      
      .btn-upgrade-notification {
          background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%) ;
          color: #000 ;
          border: none;
          padding: 15px;
          border-radius: 10px;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          margin-top: 15px;
      }
      
      .btn-upgrade-notification:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255, 193, 7, 0.4);
      }
      
      .btn-demo-again {
          background: rgba(13, 110, 253, 0.1) ;
          color: #0d6efd ;
          border: 2px solid rgba(13, 110, 253, 0.3);
          padding: 18px;
          border-radius: 12px;
          font-weight: bold;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          transition: all 0.3s;
      }
      
      .btn-demo-again:hover {
          background: rgba(13, 110, 253, 0.2) ;
          transform: translateY(-2px);
      }
      
      .btn-copy-id {
          background: rgba(255, 255, 255, 0.9) ;
          color: #333333 ;
          border: 2px solid #005a31;
          padding: 18px;
          border-radius: 12px;
          font-weight: bold;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          transition: all 0.3s;
      }
      
      .btn-copy-id:hover {
          background: rgba(0, 90, 49, 0.1) ;
          transform: translateY(-2px);
      }
      
      .btn-copy-small {
          background: rgba(255, 255, 255, 0.9) ;
          color: #333333 ;
          border: 1px solid #005a31;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-left: 10px;
          transition: all 0.3s;
      }
      
      .btn-copy-small:hover {
          background: rgba(0, 90, 49, 0.1) ;
      }
      
      /* ==================== DIVIDER ==================== */
      .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 10px 0;
          color: #666666 ;
      }
      
      .divider::before,
      .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid rgba(0, 90, 49, 0.2);
      }
      
      .divider span {
          padding: 0 15px;
      }
      
      /* ==================== INFO SECTIONS ==================== */
      .info-section {
          margin-top: 30px;
          padding-top: 25px;
          border-top: 1px solid rgba(0, 90, 49, 0.1);
      }
      
      .info-box,
      .upgrade-instructions,
      .upgrade-notification {
          background: rgba(0, 90, 49, 0.05) ;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
          border-left: 4px solid #005a31;
          color: #333333 ;
      }
      
      .info-box h4,
      .upgrade-instructions h4,
      .upgrade-notification h4 {
          color: #005a31 ;
          margin-top: 0;
          display: flex;
          align-items: center;
          gap: 10px;
      }
      
      .info-box ol {
          padding-left: 20px;
          margin: 15px 0 0 0;
      }
      
      .info-box li {
          margin-bottom: 8px;
          color: #333333 ;
      }
      
      .device-info {
          background: rgba(0, 90, 49, 0.05) ;
          padding: 15px;
          border-radius: 10px;
          border: 1px solid rgba(0, 90, 49, 0.2);
      }
      
      .device-info p {
          margin: 0 0 10px 0;
          color: #005a31 ;
          font-weight: 600;
      }
      
      .device-id {
          display: block;
          font-family: 'Courier New', monospace;
          background: rgba(0, 0, 0, 0.05);
          padding: 10px;
          border-radius: 5px;
          margin: 10px 0;
          color: #005a31 ;
          font-size: 14px;
          word-break: break-all;
          font-weight: bold;
      }
      
      /* ==================== FOOTER ==================== */
      .popup-footer {
          padding: 20px 30px;
          background: rgba(0, 90, 49, 0.05) ;
          border-top: 1px solid rgba(0, 90, 49, 0.1);
          text-align: center;
          color: #333333 ;
          flex-shrink: 0;
      }
      
      .contact-details {
          margin-bottom: 15px;
          color: #666666 ;
      }
      
      .contact-details p {
          margin: 5px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
      }
      
      .click-hint {
          margin: 0;
          color: #666666 ;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
      }
      
      .cannot-close-warning {
          color: #dc3545 ;
          font-weight: bold;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 10px;
          background: rgba(220, 53, 69, 0.1);
          border-radius: 5px;
          border: 1px solid rgba(220, 53, 69, 0.3);
      }
      
      .admin-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
      }
      
      .admin-info p {
          margin: 0;
          color: #666666 ;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
      }
      
      /* ==================== LICENSE DETAILS ==================== */
      .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 20px;
      }
      
      @media (max-width: 768px) {
          .details-grid {
              grid-template-columns: 1fr;
          }
      }
      
      /* ==================== ADMIN PANEL ==================== */
      .admin-panel {
          display: grid;
          padding: 0px;
          gap: 20px;
      }
      
      .admin-section {
          background: rgba(255, 255, 255, 0.95) ;
          border-radius: 10px;
          padding: 20px;
          border: 1px solid rgba(0, 90, 49, 0.2);
          margin-bottom: 20px;
          color: #333333 ;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
      }
      
      .admin-section h4 {
          color: #005a31 ;
          margin-top: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 2px solid rgba(0, 90, 49, 0.2);
          padding-bottom: 10px;
          margin-bottom: 15px;
      }
      
      .admin-form {
          display: grid;
          gap: 15px;
      }
      
      .form-group {
          margin-bottom: 15px;
      }
      
      .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #005a31 ;
          margin-bottom: 8px;
          font-weight: 600;
      }

      .admin-select,
      .admin-input {
          width: 100%;
          padding: 12px 15px;
          background: #ffffff ;
          border: 1px solid #005a31;
          border-radius: 8px;
          color: #333333 ;
          font-size: 14px;
          transition: all 0.3s;
      }
      
      .admin-select:focus,
      .admin-input:focus {
          outline: none;
          border-color: #005a31;
          box-shadow: 0 0 0 3px rgba(0, 90, 49, 0.2);
      }
      
      .license-list {
        width: 100%;
        overflow-x: auto;
          max-height: 300px;
          overflow-y: auto;
          margin: 15px 0;
          border: 1px solid rgba(0, 90, 49, 0.2);
          border-radius: 8px;
      }
      
      .license-list::-webkit-scrollbar {
          width: 6px;
      }
      
      .license-list::-webkit-scrollbar-thumb {
          background: rgba(0, 90, 49, 0.5);
          border-radius: 3px;
      }
      
      .admin-table {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
          background: #ffffff ;
          color: #333333 ;
      }
      
      .admin-table th {
        position: sticky;
        top: 0;
        background: rgba(0, 90, 49, 0.95);
        color: white;
        padding: 12px 10px;
        text-align: left;
        font-weight: 600;
        font-size: 14px;
        border-bottom: 2px solid #005a31;
        z-index: 10;
      }
      
      .admin-table td {
        padding: 10px;
        border-bottom: 1px solid rgba(0, 90, 49, 0.1);
        vertical-align: middle;
        word-break: break-word;
        font-size: 13px;
      }

      /* Khusus untuk kolom Kode Lisensi */
        .admin-table td:first-child {
            width: 180px;
        }
    
        .admin-table td,
        .admin-table th {
            word-break: break-word;
            white-space: normal;
        }

        .admin-table th:nth-child(1),
        .admin-table td:nth-child(1) {
            max-width: 140px;
        }
        
        .admin-table th:nth-child(3),
        .admin-table td:nth-child(3) {
            max-width: 180px;
        }       

      .admin-table tr:hover td {
          background: rgba(0, 90, 49, 0.05) ;
      }
      
      .admin-table code {
          font-family: 'Courier New', monospace;
          background: rgba(0, 90, 49, 0.05);
          padding: 3px 6px;
          border-radius: 4px;
          color: #005a31;
          font-weight: bold;
      }

      .license-code-cell {
        font-family: 'Courier New', monospace;
        background: rgba(0, 90, 49, 0.08);
        padding: 6px 10px;
        border-radius: 4px;
        display: inline-block;
        color: #005a31;
        font-weight: bold;
        font-size: 12px;
        word-break: break-all;
        max-width: 170px;
    }

    /* Badge untuk paket */
    .package-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
    }

    .package-badge.trial {
        background: rgba(253, 126, 20, 0.1);
        color: #fd7e14;
        border: 1px solid rgba(253, 126, 20, 0.3);
    }

    .package-badge.basic {
        background: rgba(13, 110, 253, 0.1);
        color: #0d6efd;
        border: 1px solid rgba(13, 110, 253, 0.3);
    }

    .package-badge.premium {
        background: rgba(111, 66, 193, 0.1);
        color: #6f42c1;
        border: 1px solid rgba(111, 66, 193, 0.3);
    }

    .package-badge.vip {
        background: rgba(255, 193, 7, 0.1);
        color: #856404;
        border: 1px solid rgba(255, 193, 7, 0.3);
    }

    /* ==================== PACKAGE BADGE IN TABLE ==================== */
    .table-package-badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        min-width: 70px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .table-package-badge.trial {
        background: linear-gradient(135deg, rgba(253, 126, 20, 0.15) 0%, rgba(253, 126, 20, 0.1) 100%);
        color: #fd7e14;
        border: 1px solid rgba(253, 126, 20, 0.3);
    }

    .table-package-badge.basic {
        background: linear-gradient(135deg, rgba(13, 110, 253, 0.15) 0%, rgba(13, 110, 253, 0.1) 100%);
        color: #0d6efd;
        border: 1px solid rgba(13, 110, 253, 0.3);
    }

    .table-package-badge.premium {
        background: linear-gradient(135deg, rgba(111, 66, 193, 0.15) 0%, rgba(111, 66, 193, 0.1) 100%);
        color: #6f42c1;
        border: 1px solid rgba(111, 66, 193, 0.3);
    }

    .table-package-badge.vip {
        background: linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 193, 7, 0.1) 100%);
        color: #856404;
        border: 1px solid rgba(255, 193, 7, 0.3);
    }

    /* Center align for package column */
    .admin-table td:nth-child(2) {
        text-align: center;
        vertical-align: middle;
        padding: 10px 5px;
    }

    /* Kolom Device ID */
    .device-id-cell {
        font-family: 'Courier New', monospace;
        font-size: 11px;
        color: #666;
    }
      
      .status-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: bold;
        display: inline-block;
        text-align: center;
        min-width: 60px;
      }
      
      .status-badge.pending {
        background: rgba(255, 193, 7, 0.1);
        color: #856404;
        border: 1px solid rgba(255, 193, 7, 0.3);
    }
    
    .status-badge.active {
        background: rgba(40, 167, 69, 0.1);
        color: #155724;
        border: 1px solid rgba(40, 167, 69, 0.3);
    }
      
      .status-badge.used {
          background: rgba(108, 117, 125, 0.2);
          color: #6c757d;
          border: 1px solid rgba(108, 117, 125, 0.3);
      }
      
      .admin-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
      }
      
      @media (max-width: 768px) {
          .admin-actions {
              flex-direction: column;
          }
      }
      
      .system-settings {
          display: grid;
          gap: 10px;
      }
      
      .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: rgba(0, 0, 0, 0.02);
          border-radius: 8px;
          border: 1px solid rgba(0, 90, 49, 0.1);
      }
      
      .setting-item label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #005a31 ;
          font-weight: 600;
      }
      
      .setting-value {
          color: #333333 ;
          font-weight: bold;
          background: rgba(0, 90, 49, 0.05);
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 14px;
      }
      
      .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #999999 ;
      }
      
      .empty-state i {
          font-size: 50px;
          margin-bottom: 15px;
          display: block;
          color: #cccccc;
      }
      
      .empty-state p {
          margin: 0;
          font-size: 16px;
      }
      
      .license-result {
          background: rgba(0, 90, 49, 0.1) ;
          border-radius: 10px;
          padding: 20px;
          border: 2px solid rgba(0, 90, 49, 0.3);
          color: #333333 ;
      }
      
      .license-result h5 {
          color: #005a31 ;
          margin-top: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
      }
      
      .result-details {
          margin: 15px 0;
      }
      
      .result-details p {
          margin: 8px 0;
          color: #333333 ;
      }
      
      .result-details strong {
          color: #005a31 ;
      }
      
      .result-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
      }
      
      @media (max-width: 768px) {
          .result-actions {
              flex-direction: column;
          }
      }

      .important-note {
          background: rgba(255, 193, 7, 0.1);
          border-left: 4px solid #ffc107;
          padding: 10px 15px;
          margin: 15px 0;
          border-radius: 4px;
          color: #856404 ;
          font-size: 14px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
      }

      .important-note i {
          color: #ffc107;
          font-size: 16px;
          margin-top: 2px;
      }
      
      /* ==================== UPGRADE OPTIONS ==================== */
      .upgrade-container {
          display: grid;
          gap: 25px;
      }
      
      .current-package-info h4 {
          color: #005a31 ;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
      }
      
      .current-package-card {
          background: rgba(255, 255, 255, 0.9) ;
          border-radius: 10px;
          padding: 20px;
          border: 2px solid rgba(0, 90, 49, 0.3);
          text-align: center;
          color: #333333 ;
      }
      
      .current-package-card.trial {
          border-color: rgba(253, 126, 20, 0.5);
      }
      
      .current-package-card.basic {
          border-color: rgba(13, 110, 253, 0.5);
      }
      
      .current-package-card.premium {
          border-color: rgba(111, 66, 193, 0.5);
      }
      
      .current-package-card.vip {
          border-color: rgba(255, 193, 7, 0.5);
      }
      
      .current-package-card h5 {
          margin-top: 0;
          color: #333333 ;
          font-size: 20px;
      }
      
      .current-package-card p {
          margin: 8px 0;
          color: #666666 ;
      }
      
      .upgrade-options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
      }
      
      @media (max-width: 768px) {
          .upgrade-options-grid {
              grid-template-columns: 1fr;
          }
      }
      
      .upgrade-option {
          background: rgba(255, 255, 255, 0.95) ;
          border-radius: 15px;
          padding: 25px;
          position: relative;
          border: 2px solid rgba(0, 90, 49, 0.3);
          transition: all 0.3s;
          color: #333333 ;
          text-align: center;
      }
      
      .upgrade-option:hover {
          transform: translateY(-5px);
          border-color: #005a31;
          box-shadow: 0 10px 25px rgba(0, 90, 49, 0.15);
      }
      
      .upgrade-option.basic {
          border-color: rgba(13, 110, 253, 0.5);
      }
      
      .upgrade-option.premium {
          border-color: rgba(111, 66, 193, 0.5);
      }
      
      .upgrade-option.vip {
          border-color: rgba(255, 193, 7, 0.5);
      }
      
      .upgrade-option.basic:hover {
          border-color: #0d6efd;
          box-shadow: 0 10px 25px rgba(13, 110, 253, 0.15);
      }
      
      .upgrade-option.premium:hover {
          border-color: #6f42c1;
          box-shadow: 0 10px 25px rgba(111, 66, 193, 0.15);
      }
      
      .upgrade-option.vip:hover {
          border-color: #ffc107;
          box-shadow: 0 10px 25px rgba(255, 193, 7, 0.15);
      }
      
      .option-badge {
          position: absolute;
          top: -12px;
          right: 15px;
          background: linear-gradient(135deg, #005a31 0%, #00816d 100%);
          color: white;
          padding: 6px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          box-shadow: 0 3px 10px rgba(0, 90, 49, 0.3);
      }
      
      .upgrade-option.basic .option-badge {
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
      }
      
      .upgrade-option.premium .option-badge {
          background: linear-gradient(135deg, #6f42c1 0%, #6610f2 100%);
      }
      
      .upgrade-option.vip .option-badge {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: #000;
      }
      
      .upgrade-option h4 {
          margin-top: 0;
          color: #333333 ;
          font-size: 24px;
          margin-bottom: 10px;
      }
      
      .option-price {
          font-size: 32px;
          font-weight: bold;
          color: #005a31 ;
          margin: 15px 0;
      }
      
      .upgrade-option.basic .option-price {
          color: #0d6efd ;
      }
      
      .upgrade-option.premium .option-price {
          color: #6f42c1 ;
      }
      
      .upgrade-option.vip .option-price {
          color: #ffc107 ;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .option-original-price {
          text-decoration: line-through;
          color: #999999 ;
          font-size: 14px;
          margin-bottom: 10px;
      }
      
      .option-duration {
          background: rgba(0, 90, 49, 0.1);
          display: inline-block;
          padding: 6px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #005a31 ;
      }
      
      .upgrade-option.basic .option-duration {
          background: rgba(13, 110, 253, 0.1);
          color: #0d6efd ;
      }
      
      .upgrade-option.premium .option-duration {
          background: rgba(111, 66, 193, 0.1);
          color: #6f42c1 ;
      }
      
      .upgrade-option.vip .option-duration {
          background: rgba(255, 193, 7, 0.1);
          color: #000 ;
      }
      
      .option-features {
          list-style: none;
          padding: 0;
          margin: 20px 0;
          text-align: left;
      }
      
      .option-features li {
          padding: 8px 0;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #333333 ;
          border-bottom: 1px solid rgba(0, 90, 49, 0.1);
      }
      
      .option-features li:last-child {
          border-bottom: none;
      }
      
      .option-features .bi-check-circle {
          color: #28a745;
      }
      
      .option-features .bi-x-circle {
          color: #dc3545;
      }
      
      .upgrade-confirmation,
      .upgrade-instruction {
          background: rgba(255, 255, 255, 0.95) ;
          padding: 30px;
          border-radius: 15px;
          text-align: center;
          border: 2px solid rgba(0, 90, 49, 0.3);
          color: #333333 ;
      }
      
      .upgrade-confirmation h4,
      .upgrade-instruction h4 {
          color: #005a31 ;
          margin-top: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 24px;
      }
      
      .confirmation-details {
          text-align: left;
          background: rgba(0, 90, 49, 0.05);
          padding: 20px;
          border-radius: 10px;
          margin: 25px 0;
          border: 1px solid rgba(0, 90, 49, 0.1);
      }
      
      .confirmation-details p {
          margin: 10px 0;
          color: #333333 ;
      }
      
      .confirmation-details strong {
          color: #005a31 ;
      }
      
      .confirmation-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 25px;
      }
      
      @media (max-width: 768px) {
          .confirmation-actions {
              flex-direction: column;
          }
      }
      
      .instruction-content {
          text-align: left;
          margin: 25px 0;
      }
      
      .instruction-content p {
          margin: 15px 0;
          color: #333333 ;
      }
      
      .instruction-content ol {
          padding-left: 20px;
          margin: 15px 0;
      }
      
      .instruction-content li {
          margin-bottom: 10px;
          color: #333333 ;
      }
      
      .device-id-reminder {
          background: rgba(255, 215, 0, 0.1);
          padding: 20px;
          border-radius: 10px;
          margin-top: 25px;
          border: 1px solid rgba(255, 215, 0, 0.3);
          text-align: center;
      }
      
      .device-id-reminder p {
          margin: 0 0 10px 0;
          color: #333333 ;
          font-weight: 600;
      }
      
      .device-id-reminder code {
          font-family: 'Courier New', monospace;
          background: rgba(0, 0, 0, 0.05);
          padding: 10px;
          border-radius: 5px;
          display: block;
          margin: 10px 0;
          color: #005a31 ;
          font-weight: bold;
          word-break: break-all;
      }
      
      .instruction-actions {
          margin-top: 25px;
      }
      
      /* ==================== EXPIRED POPUP PACKAGE COMPARISON ==================== */
      .package-comparison {
          margin: 30px 0;
      }
      
      .package-comparison h4 {
          color: #005a31 ;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: center;
      }
      
      .packages-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin: 20px 0;
      }
      
      @media (max-width: 768px) {
          .packages-grid {
              grid-template-columns: 1fr;
          }
      }
      
      .package-card {
          background: rgba(255, 255, 255, 0.95) ;
          border-radius: 15px;
          padding: 25px;
          position: relative;
          border: 2px solid rgba(0, 90, 49, 0.2);
          transition: all 0.3s;
          color: #333333 ;
          text-align: center;
      }
      
      .package-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      }
      
      .package-card.basic {
          border-color: rgba(13, 110, 253, 0.3);
      }
      
      .package-card.premium {
          border-color: rgba(111, 66, 193, 0.3);
          transform: scale(1.05);
          border-width: 3px;
      }
      
      .package-card.vip {
          border-color: rgba(255, 193, 7, 0.3);
      }
      
      .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #6f42c1 0%, #6610f2 100%);
          color: white;
          padding: 6px 20px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          box-shadow: 0 3px 10px rgba(111, 66, 193, 0.3);
      }
      
      .vip-badge {
          position: absolute;
          bottom: 0px;
          left: 0px;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #333 0%, #333 100%);
          color: #000;
          padding: 6px 20px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          box-shadow: 0 3px 10px rgba(255, 215, 0, 0.3);
      }
      
      .package-card h5 {
          margin-top: 0;
          font-size: 22px;
          color: #333333 ;
          margin-bottom: 15px;
      }
      
      .package-card .price {
          font-size: 28px;
          font-weight: bold;
          color: #005a31 ;
          margin: 15px 0;
      }
      
      .package-card.basic .price {
          color: #0d6efd ;
      }
      
      .package-card.premium .price {
          color: #6f42c1 ;
      }
      
      .package-card.vip .price {
          color: #ffc107 ;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .package-card .duration {
          background: rgba(0, 90, 49, 0.1);
          display: inline-block;
          padding: 6px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #005a31 ;
      }
      
      .package-card.basic .duration {
          background: rgba(13, 110, 253, 0.1);
          color: #0d6efd ;
      }
      
      .package-card.premium .duration {
          background: rgba(111, 66, 193, 0.1);
          color: #6f42c1 ;
      }
      
      .package-card.vip .duration {
          background: rgba(255, 193, 7, 0.1);
          color: #000 ;
      }
      
      .package-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 14px;
          text-align: left;
      }
      
      .package-card li {
          padding: 8px 0;
          border-bottom: 1px solid rgba(0, 90, 49, 0.1);
          color: #333333 ;
          display: flex;
          align-items: center;
          gap: 8px;
      }
      
      .package-card li:last-child {
          border-bottom: none;
      }
      
      /* ==================== WARNING CARD ==================== */
      .warning-icon {
          font-size: 80px;
          color: #dc3545;
          margin-bottom: 20px;
          animation: pulse 1.5s infinite;
          display: block;
          text-align: center;
      }
      
      .warning-message {
          background: rgba(220, 53, 69, 0.05);
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
          border-left: 4px solid #dc3545;
          text-align: center;
      }
      
      .warning-message p {
          margin: 10px 0;
          color: #333333 ;
          font-size: 16px;
      }
      
      .contact-actions {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 30px;
      }
      
      /* ==================== TOAST NOTIFICATION ==================== */
      .license-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 15px 25px;
          border-radius: 10px;
          color: white ;
          font-weight: bold;
          z-index: 100000;
          animation: slideUp 0.3s ease;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: 400px;
      }
      
      .toast-success {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%) ;
          border-left: 4px solid #155724;
      }
      
      .toast-error {
          background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%) ;
          border-left: 4px solid #721c24;
      }
      
      .toast-info {
          background: linear-gradient(135deg, #17a2b8 0%, #138496 100%) ;
          border-left: 4px solid #0c5460;
      }
      
      /* ==================== RESPONSIVE DESIGN ==================== */
      @media (max-width: 992px) {
          .offline-license-popup {
              max-width: 95% ;
          }
          
          .popup-header {
              padding: 25px;
          }
          
          .popup-body {
              padding: 25px;
          }
      }
      
      @media (max-width: 768px) {
          .offline-license-popup {
              max-width: 98% ;
              margin: 10px auto ;
          }
          
          .popup-header {
              padding: 20px;
          }
          
          .popup-header h2 {
              font-size: 24px;
          }
          
          .header-icon {
              font-size: 50px;
          }
          
          .popup-body {
              padding: 20px;
              max-height: 70vh ;
          }
          
          .activation-card,
          .license-details-card,
          .expired-warning-card,
          .admin-section,
          .upgrade-container {
              padding: 20px;
          }
          
          .license-input {
              font-size: 18px;
              padding: 15px;
          }
          
          .btn-activate-large,
          .btn-demo-mode,
          .btn-contact,
          .btn-admin-panel,
          .btn-deactivate,
          .btn-whatsapp,
          .btn-copy-id,
          .btn-demo-again {
              padding: 16px;
              font-size: 15px;
          }
          
          .admin-footer {
              flex-direction: column;
              text-align: center;
          }
          
          .admin-table {
              font-size: 12px;
          }
          
          .admin-table th,
          .admin-table td {
              padding: 8px 10px;
          }
          
          .upgrade-options-grid {
              grid-template-columns: 1fr;
          }
          
          .packages-grid {
              grid-template-columns: 1fr;
          }
          
          .package-card.premium {
              transform: scale(1);
          }
          
          .action-buttons,
          .confirmation-actions,
          .result-actions,
          .admin-actions {
              flex-direction: column;
          }
      }
      
      @media (max-width: 480px) {
          .offline-license-popup {
              border-radius: 15px;
          }
          
          .popup-header {
              padding: 15px;
          }
          
          .popup-header h2 {
              font-size: 20px;
          }
          
          .subtitle {
              font-size: 14px;
          }
          
          .header-icon {
              font-size: 40px;
          }
          
          .popup-body {
              padding: 15px;
              max-height: 75vh ;
          }
          
          .popup-footer {
              padding: 15px;
          }
          
          .activation-card,
          .license-details-card,
          .expired-warning-card,
          .admin-section,
          .upgrade-container {
              padding: 15px;
          }
          
          .license-input {
              font-size: 16px;
              padding: 12px;
          }
          
          .details-grid {
              grid-template-columns: 1fr;
              gap: 10px;
          }
          
          .package-features {
              flex-direction: column;
              gap: 8px;
          }
          
          .warning-icon {
              font-size: 60px;
          }
          
          .package-card,
          .upgrade-option {
              padding: 20px;
          }
      }
      
      /* ==================== FIX FOR SCROLL ON MOBILE ==================== */
      @media (max-width: 768px) {
          #offlineLicenseOverlay {
              padding: 10px ;
              align-items: flex-start ;
          }
          
          .offline-license-popup {
              margin-top: 10px ;
              margin-bottom: 10px ;
          }
      }
      
      /* ==================== PRINT STYLES ==================== */
      @media print {
          #offlineLicenseOverlay {
              position: relative ;
              background: white ;
          }
          
          .offline-license-popup {
              box-shadow: none ;
              border: 2px solid #000 ;
              max-width: 100% ;
              margin: 0 ;
          }
          
          .btn-activate-large,
          .btn-demo-mode,
          .btn-contact,
          .btn-admin-panel,
          .btn-deactivate,
          .btn-close,
          .btn-copy,
          .btn-copy-id,
          .btn-demo-again,
          .btn-upgrade-now,
          .btn-upgrade-notification,
          .btn-confirm-upgrade,
          .btn-cancel-upgrade,
          .btn-admin-generate,
          .btn-admin-secondary,
          .btn-admin-danger,
          .btn-admin-close,
          .btn-copy-admin,
          .btn-whatsapp-admin,
          .btn-whatsapp {
              display: none ;
          }
      }

      /* Demo Features List */
      .demo-features {
          background: rgba(255, 107, 107, 0.05);
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
          border-left: 4px solid #ff6b6b;
      }

      .demo-features h4 {
          color: #ff6b6b ;
          display: flex;
          align-items: center;
          gap: 10px;
      }

      .demo-warning {
          background: rgba(255, 193, 7, 0.1);
          padding: 15px;
          border-radius: 10px;
          margin: 20px 0;
          border: 1px solid rgba(255, 193, 7, 0.3);
      }

      .demo-warning h4 {
          color: #ffc107 ;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 0;
      }

      .demo-timer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #ff6b6b;
          font-weight: bold;
          font-size: 16px;
      }

      #demoTimeRemaining {
          background: rgba(255, 107, 107, 0.1);
          padding: 5px 10px;
          border-radius: 5px;
          font-family: 'Courier New', monospace;
          font-size: 18px;
          min-width: 60px;
          display: inline-block;
          text-align: center;
      }

      /* ==================== FOCUSED INPUT MODE ==================== */
      .focused-input-mode {
          max-width: 500px ;
          min-height: auto ;
      }

      .focused-input-mode .popup-header,
      .focused-input-mode .popup-body .action-section,
      .focused-input-mode .popup-body .info-section,
      .focused-input-mode .popup-footer .contact-details {
          display: none ;
      }

      /* TAMBAHKAN INI: Jangan sembunyikan package preview */
      .focused-input-mode .package-preview {
          display: block ;
          opacity: 1 ;
          visibility: visible ;
          margin-top: 20px ;
          animation: slideUp 0.3s ease ;
      }

      .focused-input-mode .popup-body {
          padding: 30px ;
          max-height: none ;
          overflow: visible ;
      }

      .focused-input-mode .activation-card {
          background: transparent ;
          border: none ;
          box-shadow: none ;
          padding: 0 ;
      }

      .focused-input-mode .license-input-section {
          margin-bottom: 0 ;
      }

      .focused-input-mode .input-group {
          position: relative;
          margin-bottom: 15px ;
      }

      .focused-input-mode .license-input {
          font-size: 24px ;
          padding: 20px 60px 20px 20px ;
          border-radius: 12px ;
          border-width: 3px ;
          letter-spacing: 2px ;
      }

      .focused-input-mode .input-hint {
          font-size: 14px ;
          margin-top: 10px ;
          text-align: center ;
      }

      .focused-input-mode .package-preview {
          min-height: 80px ;
          margin-top: 20px ;
          background: rgba(255, 255, 255, 0.95) ;
          border: 2px solid rgba(0, 90, 49, 0.2) ;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1) ;
      }

      /* Tombol close di pojok kanan atas */
      .close-focused-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.1) ;
          border: none;
          color: #333 ;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          z-index: 1000;
      }

      .close-focused-btn:hover {
          background: rgba(0, 90, 49, 0.2) ;
          transform: rotate(90deg);
      }

      /* Tombol status validasi di dalam input */
      .input-validation-icons {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          gap: 10px;
      }

      .validation-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.3s;
          opacity: 0.7;
      }

      .validation-icon:hover {
          opacity: 1;
          transform: scale(1.1);
      }

      .validation-icon.valid {
          background: rgba(40, 167, 69, 0.2) ;
          color: #28a745 ;
          border: 2px solid rgba(40, 167, 69, 0.3);
      }

      .validation-icon.invalid {
          background: rgba(220, 53, 69, 0.2) ;
          color: #dc3545 ;
          border: 2px solid rgba(220, 53, 69, 0.3);
      }

      .validation-icon.disabled {
          opacity: 0.3;
          cursor: not-allowed;
      }

      .validation-icon.active {
          opacity: 1;
          box-shadow: 0 0 0 4px rgba(0, 90, 49, 0.1);
      }

      /* ==================== HIGHLIGHT CURRENT DEVICE ==================== */
      .current-device {
      background: rgba(0, 90, 49, 0.15) ;
      border-left: 4px solid #005a31 ;
      position: relative;
      }

      .current-device::before {
      content: '✓ PERANGKAT INI';
      position: absolute;
      top: 5px;
      right: 5px;
      background: #005a31;
      color: white;
      font-size: 10px;
      padding: 2px 5px;
      border-radius: 3px;
      }

      /* ==================== LICENSE RESULT POPUP ==================== */
      .license-result-popup {
      text-align: center;
      padding: 20px;
      }

      .result-icon {
      font-size: 80px;
      color: #28a745;
      margin-bottom: 20px;
      }

      .result-details {
      background: rgba(0, 90, 49, 0.05);
      border-radius: 10px;
      padding: 20px;
      margin: 20px 0;
      text-align: left;
      }

      .result-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(0, 90, 49, 0.1);
      }

      .result-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
      }

      .result-item label {
      font-weight: bold;
      color: #005a31;
      }

      .result-value {
      color: #333;
      }

      .license-code {
      font-family: 'Courier New', monospace;
      font-size: 18px;
      font-weight: bold;
      color: #005a31;
      }

      .result-note {
      background: rgba(255, 193, 7, 0.1);
      border-left: 4px solid #ffc107;
      padding: 15px;
      border-radius: 5px;
      margin-top: 20px;
      text-align: left;
      font-size: 14px;
      }

      .result-note p {
      margin: 5px 0;
      }

      .close-popup-btn {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      position: absolute;
      top: 15px;
      right: 15px;
      transition: all 0.3s;
      }

      .close-popup-btn:hover {
      color: #ffc107;
      transform: scale(1.1);
      }

      /* ==================== LICENSE STATS ==================== */
    .license-stats {
        display: flex;
        justify-content: space-around;
        margin: 15px 0;
        padding: 10px;
        background: rgba(0, 90, 49, 0.05);
        border-radius: 8px;
        font-size: 14px;
    }

    .license-stats span {
        display: flex;
        align-items: center;
        gap: 5px;
        color: #005a31;
        font-weight: 600;
    }

    .license-stats i {
        font-size: 16px;
    }

    /* ==================== STYLING UNTUK WELCOME DEMO ==================== */
    .demo-welcome-card {
        text-align: center;
        padding: 20px;
    }
    
    .demo-icon {
        font-size: 80px;
        color: #6f42c1;
        margin-bottom: 20px;
    }
    
    .demo-message {
        background: rgba(111, 66, 193, 0.1);
        padding: 20px;
        border-radius: 10px;
        margin: 20px 0;
        text-align: left;
    }
    
    .demo-features-list {
        list-style: none;
        padding: 0;
        margin: 15px 0;
    }
    
    .demo-features-list li {
        padding: 8px 0;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .demo-features-list .bi-check-circle {
        color: #28a745;
    }
    
    .demo-features-list .bi-x-circle {
        color: #dc3545;
    }
    
    .demo-note {
        background: rgba(255, 193, 7, 0.1);
        padding: 10px;
        border-radius: 5px;
        margin-top: 15px;
        font-size: 14px;
    }
    
    .demo-actions {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin: 25px 0;
    }
    
    .demo-timer-info {
        color: #666;
        font-size: 14px;
        text-align: center;
        margin-top: 15px;
    }
    
    /* ==================== STYLING UNTUK PILIHAN PAKET ==================== */
    .packages-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 20px;
        margin: 20px 0;
    }
    
    @media (max-width: 768px) {
        .packages-grid {
            grid-template-columns: 1fr;
        }
    }
    
    .package-card {
        background: white;
        border-radius: 15px;
        padding: 25px;
        position: relative;
        border: 2px solid #ddd;
        transition: all 0.3s;
        text-align: center;
    }
    
    .package-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }
    
    .package-card.free {
        border-color: #17a2b8;
    }
    
    .package-card.basic {
        border-color: #0d6efd;
    }
    
    .package-card.premium {
        border-color: #6f42c1;
    }
    
    .package-card.vip {
        border-color: #ffc107;
    }
    
    .package-badge {
        position: absolute;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        padding: 6px 20px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
        color: white;
    }
    
    .package-badge.popular {
        background: linear-gradient(135deg, #6f42c1 0%, #6610f2 100%);
    }
    
    .package-badge.vip {
        background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
        color: #000;
    }
    
    .package-card.free .package-badge {
        background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
    }
    
    .package-card h4 {
        margin-top: 0;
        color: #333;
        font-size: 22px;
        margin-bottom: 10px;
    }
    
    .package-price {
        font-size: 28px;
        font-weight: bold;
        margin: 15px 0;
    }
    
    .package-card.free .package-price {
        color: #17a2b8;
    }
    
    .package-card.basic .package-price {
        color: #0d6efd;
    }
    
    .package-card.premium .package-price {
        color: #6f42c1;
    }
    
    .package-card.vip .package-price {
        color: #ffc107;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .package-duration {
        background: rgba(0, 0, 0, 0.05);
        display: inline-block;
        padding: 6px 15px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 20px;
    }
    
    .package-features {
        list-style: none;
        padding: 0;
        margin: 20px 0;
        text-align: left;
    }
    
    .package-features li {
        padding: 8px 0;
        display: flex;
        align-items: center;
        gap: 10px;
        border-bottom: 1px solid #eee;
    }
    
    .package-features li:last-child {
        border-bottom: none;
    }
    
    .btn-package-select {
        width: 100%;
        padding: 15px;
        border: none;
        border-radius: 10px;
        font-weight: bold;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s;
        margin-top: 10px;
    }
    
    .btn-package-select.free {
        background: #17a2b8;
        color: white;
    }
    
    .btn-package-select.basic {
        background: #0d6efd;
        color: white;
    }
    
    .btn-package-select.premium {
        background: #6f42c1;
        color: white;
    }
    
    .btn-package-select.vip {
        background: #ffc107;
        color: #000;
    }
    
    .btn-package-select:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }
    
    .package-back {
        text-align: center;
        margin-top: 20px;
    }
    
    .btn-back {
        background: none;
        border: 2px solid #005a31;
        color: #005a31;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
    
    .btn-back:hover {
        background: rgba(0, 90, 49, 0.1);
    }
    
    /* ==================== STYLING UNTUK DEMO EXPIRED ==================== */
    .demo-expired-message {
        text-align: center;
        padding: 20px;
    }
    
    .warning-icon {
        font-size: 60px;
        color: #dc3545;
        margin-bottom: 20px;
        animation: pulse 1.5s infinite;
    }
    
    .packages-grid-expired {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin: 25px 0;
    }
    
    .package-card-expired {
        background: white;
        border-radius: 10px;
        padding: 20px;
        border: 2px solid #ddd;
        text-align: center;
    }
    
    .package-card-expired.free {
        border-color: #17a2b8;
    }
    
    .package-card-expired.basic {
        border-color: #0d6efd;
    }
    
    .package-card-expired.premium {
        border-color: #6f42c1;
    }
    
    .package-card-expired.vip {
        border-color: #ffc107;
    }
    
    .package-card-expired h5 {
        margin-top: 0;
        color: #333;
    }
    
    .package-card-expired .price {
        font-size: 20px;
        font-weight: bold;
        margin: 10px 0;
    }
    
    .package-card-expired.free .price {
        color: #17a2b8;
    }
    
    .package-card-expired.basic .price {
        color: #0d6efd;
    }
    
    .package-card-expired.premium .price {
        color: #6f42c1;
    }
    
    .package-card-expired.vip .price {
        color: #ffc107;
    }
    
    .package-card-expired .duration {
        background: rgba(0, 0, 0, 0.05);
        padding: 4px 10px;
        border-radius: 15px;
        font-size: 12px;
        display: inline-block;
        margin-bottom: 15px;
    }
    
    .package-card-expired ul {
        list-style: none;
        padding: 0;
        margin: 15px 0;
        font-size: 14px;
    }
    
    .package-card-expired li {
        padding: 4px 0;
        border-bottom: 1px solid #eee;
    }
    
    .package-card-expired li:last-child {
        border-bottom: none;
    }
    
    .btn-package-select-expired {
        width: 100%;
        padding: 10px;
        border: none;
        border-radius: 5px;
        background: #005a31;
        color: white;
        font-weight: bold;
        cursor: pointer;
        margin-top: 10px;
    }
    
    .btn-package-select-expired:hover {
        background: #00816d;
    }
    
    /* ==================== STYLING UNTUK TIMER DEMO ==================== */
    .demo-timer-card {
        text-align: center;
        padding: 20px;
    }
    
    .timer-display {
        margin: 20px 0;
    }
    
    .timer {
        font-size: 60px;
        font-weight: bold;
        color: #6f42c1;
        font-family: 'Courier New', monospace;
    }
    
    .timer-label {
        color: #666;
        font-size: 14px;
        margin-top: 5px;
    }
    
    .demo-upgrade-option {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-top: 25px;
    }

    /* ==================== PACKAGE STATUS PREVIEW ==================== */
    .package-status {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 15px;
        border-radius: 10px;
        animation: slideUp 0.3s ease;
        color: #333333 ;
        width: 100%;
        border: 2px solid transparent;
    }

    .package-used {
        background: rgba(255, 193, 7, 0.1) ;
        border-color: rgba(255, 193, 7, 0.3);
    }

    .package-expired {
        background: rgba(220, 53, 69, 0.1) ;
        border-color: rgba(220, 53, 69, 0.3);
    }

    .package-status .package-icon {
        font-size: 40px;
        color: #dc3545;
    }

    .package-used .package-icon {
        color: #ffc107;
    }

    .package-expired .package-icon {
        color: #dc3545;
    }

    .package-status .package-info h4 {
        margin: 0 0 5px 0;
        font-size: 18px;
        color: #333333 ;
    }

    .package-status .package-info p {
        margin: 0 0 10px 0;
        color: #666666 ;
        font-size: 14px;
    }

    .package-warning {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.05);
        border-radius: 5px;
        font-size: 12px;
        color: #666;
        margin-top: 10px;
        border-left: 3px solid #dc3545;
    }

    .package-used .package-warning {
        border-left-color: #ffc107;
    }

    .package-expired .package-warning {
        border-left-color: #dc3545;
    }

    .package-warning i {
        font-size: 14px;
    }

  `;
  
  style.textContent = css;
  document.head.appendChild(style);
};

// ==================== GLOBAL FUNCTIONS ====================
function copyToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  
  try {
      var successful = document.execCommand('copy');
      if (successful) {
          showGlobalToast('✓ Berhasil disalin ke clipboard', 'success');
      } else {
          showGlobalToast('Gagal menyalin', 'error');
      }
  } catch (err) {
      console.error('Copy failed:', err);
      showGlobalToast('Gagal menyalin', 'error');
  }
  
  document.body.removeChild(textArea);
}

function showGlobalToast(message, type) {
  var toast = document.createElement('div');
  
  var backgroundColor = '#17a2b8';
  if (type === 'success') backgroundColor = '#28a745';
  else if (type === 'error') backgroundColor = '#dc3545';
  else if (type === 'warning') backgroundColor = '#ffc107';
  
  toast.style.cssText = [
      'position: fixed;',
      'top: 20px;',
      'right: 20px;',
      'padding: 15px 25px;',
      'background: ' + backgroundColor + ';',
      'color: white;',
      'border-radius: 8px;',
      'z-index: 100001;',
      'animation: slideUp 0.3s ease;',
      'box-shadow: 0 5px 15px rgba(0,0,0,0.3);',
      'font-weight: bold;',
      'display: flex;',
      'align-items: center;',
      'gap: 10px;',
      'max-width: 400px;'
  ].join('');
  
  var icon = '';
  if (type === 'success') icon = 'bi-check-circle';
  else if (type === 'error') icon = 'bi-exclamation-circle';
  else if (type === 'warning') icon = 'bi-exclamation-triangle';
  else icon = 'bi-info-circle';
  
  toast.innerHTML = [
      '<i class="bi ' + icon + '"></i>',
      '<span>' + message + '</span>'
  ].join('');
  
  document.body.appendChild(toast);
  
  setTimeout(function() {
      if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
      }
  }, 3000);
}

// ==================== INITIALIZE ====================
window.offlineLicense = new OfflineLicenseSystem();

// Tambahkan resize listener untuk adjust height
window.addEventListener('resize', function() {
  if (window.offlineLicense && typeof window.offlineLicense.adjustPopupHeight === 'function') {
      window.offlineLicense.adjustPopupHeight();
  }
});

// Tunggu sampai DOM siap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
      // Tunggu sebentar sebelum inisialisasi
      setTimeout(function() {
          window.offlineLicense.initialize();
      }, 1500);
  });
} else {
  setTimeout(function() {
      window.offlineLicense.initialize();
  }, 1500);
}

// Export untuk penggunaan global
if (typeof window !== 'undefined') {
  window.OfflineLicenseSystem = OfflineLicenseSystem;
  window.copyToClipboard = copyToClipboard;
  window.showGlobalToast = showGlobalToast;
}
