let registeredUser = null;
const adminFee = 3000; 

document.addEventListener("DOMContentLoaded", () => {
    const savedUser = localStorage.getItem("registeredUser");
    if (savedUser) {
        registeredUser = JSON.parse(savedUser);
        toggleSections(true);
        document.getElementById('userGreeting').innerText = registeredUser.username;
    } else {
        toggleSections(false);
    }
});

function toggleSections(isLoggedIn) {
    document.getElementById('registerFormSection').classList.toggle('hidden', isLoggedIn);
    document.getElementById('shortcutSection').classList.toggle('hidden', !isLoggedIn);
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.classList.toggle('hidden', !isLoggedIn);
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateRegistrationForm() {
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();

    if (!username) {
        alert("Mohon isi username.");
        return false;
    }
    if (!email) {
        alert("Mohon isi email.");
        return false;
    }
    if (!password) {
        alert("Mohon isi password.");
        return false;
    }
    if (!validateEmail(email)) {
        alert("Mohon masukkan email yang valid.");
        return false;
    }

    return true;
}

function register() {
    if (validateRegistrationForm()) {
        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value.trim();

        registeredUser = { username, email, password };
        localStorage.setItem("registeredUser", JSON.stringify(registeredUser));

        alert("Pendaftaran Berhasil!");
        toggleSections(true);
        document.getElementById('userGreeting').innerText = username;
    }
}

function logout() {
    localStorage.removeItem("registeredUser");
    registeredUser = null;

    alert("Anda telah keluar.");
    toggleSections(false);
    hideAllForms();
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('registerPassword');
    const showPasswordCheckbox = document.getElementById('showPasswordCheckbox');
    passwordInput.type = showPasswordCheckbox.checked ? 'text' : 'password';
}

function showForm(formId) {
    hideAllForms();
    document.getElementById(formId).classList.remove('hidden');
    addBackButton(formId);
}

function validateFormFields(fields) {
    let valid = true;
    fields.forEach(({ id, message }) => {
        const field = document.getElementById(id);
        if (!field || field.value.trim() === "") {
            alert(message); 
            valid = false;
        }
    });
    if (!valid) {
        alert("Mohon Isi Semua Persyaratan Untuk Melanjutkan");
    }
    return valid; 
}


function validatePulsaForm() {
    return validateFormFields([
        { id: 'phoneNumber', message: "Mohon isi nomor HP." },
        { id: 'nominalPulsa', message: "Mohon isi nominal pulsa." }
    ]);
}

function validatePaketDataForm() {
    return validateFormFields([
        { id: 'dataPhoneNumber', message: "Mohon isi nomor HP." },
        { id: 'nominalData', message: "Mohon isi nominal paket data." }
    ]);
}

function validateTokenForm() {
    return validateFormFields([
        { id: 'meterNumber', message: "Mohon isi nomor meter." },
        { id: 'nominalToken', message: "Mohon isi nominal token." }
    ]);
}

function validateEMoneyForm() {
    return validateFormFields([
        { id: 'eMoneyNumber', message: "Mohon isi nomor e-money." },
        { id: 'nominalEMoney', message: "Mohon isi nominal e-money." }
    ]);
}

function back(formId) {
    const formElement = document.getElementById(formId);
    if (formElement) {
        formElement.classList.add('hidden');
        document.getElementById('shortcutSection').classList.remove('hidden');
    }
}

function hideAllForms() {
    const forms = ['pulsaForm', 'paketDataForm', 'tokenForm', 'eMoneyForm', 'paymentForm', 'receiptForm', 'shortcutSection', 'termsModal'];
    forms.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('hidden');
        }
    });
}

function updateTotalPrice(formId, nominalInputId, totalPriceId) {
    const nominal = parseInt(document.getElementById(nominalInputId).value) || 0;
    if (nominal > 0) {
        document.getElementById(totalPriceId).innerText = `Rp ${nominal + adminFee}`;
    } else {
        alert("Mohon isi nominal yang valid.");
    }
}

function validateCurrentForm() {
    const forms = [
        { formId: 'pulsaForm', validateFunc: validatePulsaForm },
        { formId: 'paketDataForm', validateFunc: validatePaketDataForm },
        { formId: 'tokenForm', validateFunc: validateTokenForm },
        { formId: 'eMoneyForm', validateFunc: validateEMoneyForm }
    ];

    for (const form of forms) {
        if (!document.getElementById(form.formId).classList.contains('hidden')) {
            return form.validateFunc();
        }
    }
    return false;
}

let currentPaymentAmount = 0; 
function goToPayment() {
    if (validateCurrentForm()) {
        currentPaymentAmount = getCurrentPaymentAmount(); 
        if (currentPaymentAmount > 0) {
            document.getElementById('paymentAmount').innerText = `Rp ${currentPaymentAmount.toLocaleString()}`;
            hideAllForms();
            document.getElementById('paymentForm').classList.remove('hidden');
            alert("Lanjut ke pembayaran!");
        } else {
            alert("Tidak ada nominal yang dipilih. Silakan pilih nominal terlebih dahulu.");
        }
    }
}

function validatePaymentForm() {
    return validateFormFields([
        { id: 'cardNumber', message: "Mohon isi nomor kartu." },
        { id: 'cardName', message: "Mohon isi nama pemegang kartu." },
        { id: 'cardCVV', message: "Mohon isi CVV." },
        { id: 'cardExpiry', message: "Mohon isi tanggal kedaluwarsa." }
    ]);
}

function confirmPayment() {
    if (validatePaymentForm() && currentPaymentAmount > 0) {
        hideAllForms();
        document.getElementById('receiptAmount').innerText = `Rp ${currentPaymentAmount.toLocaleString()}`;
        document.getElementById('receiptDate').innerText = new Date().toLocaleString();
        document.getElementById('receiptForm').classList.remove('hidden');
        alert("Pembayaran berhasil!");
    } else {
        alert("Mohon isi semua data pembayaran dengan benar.");
    }
}

function getCurrentPaymentAmount() {
    const forms = [
        { formId: 'pulsaForm', inputId: 'nominalPulsa' },
        { formId: 'paketDataForm', inputId: 'nominalData' },
        { formId: 'tokenForm', inputId: 'nominalToken' },
        { formId: 'eMoneyForm', inputId: 'nominalEMoney' }
    ];

    for (const form of forms) {
        if (!document.getElementById(form.formId).classList.contains('hidden')) {
            const nominal = parseInt(document.getElementById(form.inputId).value) || 0;
            if (nominal <= 0) {
                alert("Mohon isi semua data sebelum melanjutkan pembayaran.");
                return 0;
            }
            return nominal;
        }
    }
    return 0;
}

function hideReceiptForm() {
    hideAllForms();
    document.getElementById('shortcutSection').classList.remove('hidden');
    alert("Transaksi selesai, kembali ke menu utama.");
}

function openTermsModal() {
    hideAllForms();
    showForm('termsModal');
}

function closeTermsModal() {
    hideAllForms();
    document.getElementById('shortcutSection').classList.remove('hidden');
}

window.addEventListener("click", (event) => {
    const modal = document.getElementById("termsModal");
    if (event.target === modal) closeTermsModal();
});

function showPulsaForm() {
    hideAllForms();
    document.getElementById('pulsaForm').classList.remove('hidden');
    addBackButton('pulsaForm');
}

function showPaketDataForm() {
    hideAllForms();
    document.getElementById('paketDataForm').classList.remove('hidden');
    addBackButton('paketDataForm');
}

function showTokenForm() {
    hideAllForms();
    document.getElementById('tokenForm').classList.remove('hidden');
    addBackButton('tokenForm');
}

function showEMoneyForm() {
    hideAllForms();
    document.getElementById('eMoneyForm').classList.remove('hidden');
    addBackButton('eMoneyForm');
}

function updateTotalPricePulsa() {
    const nominal = parseInt(document.getElementById('nominalPulsa').value) || 0;
    document.getElementById('totalPricePulsa').innerText = `Rp ${nominal.toLocaleString()}`;
}

function updateTotalPriceData() {
    const nominal = parseInt(document.getElementById('nominalData').value) || 0;
    document.getElementById('totalPriceData').innerText = `Rp ${nominal.toLocaleString()}`;
}

function updateTotalPriceToken() {
    const nominal = parseInt(document.getElementById('nominalToken').value) || 0;
    document.getElementById('totalPriceToken').innerText = `Rp ${nominal.toLocaleString()}`;
}

function updateTotalPriceEMoney() {
    const nominal = parseInt(document.getElementById('nominalEMoney').value) || 0;
    document.getElementById('totalPriceEMoney').innerText = `Rp ${nominal.toLocaleString()}`;
}

function toggleCVVVisibility() {
    const cvvInput = document.getElementById('cardCVV');
    const showCVVCheckbox = document.getElementById('showCVVCheckbox');
    cvvInput.type = showCVVCheckbox.checked ? 'text' : 'password';
}
function confirmPayment() {
    if (validatePaymentForm() && currentPaymentAmount > 0) {
        // Simpan transaksi ke riwayat
        saveTransactionToHistory(currentPaymentAmount);

        hideAllForms();
        document.getElementById('receiptAmount').innerText = `Rp ${currentPaymentAmount.toLocaleString()}`;
        document.getElementById('receiptDate').innerText = new Date().toLocaleString();
        document.getElementById('receiptForm').classList.remove('hidden');
        alert("Pembayaran berhasil!");
    } else {
        alert("Mohon isi semua data pembayaran dengan benar.");
    }
}

document.getElementById("toggle-dark-mode").addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");
    if (document.body.classList.contains("dark-mode")) {
        this.innerHTML = "🌞"; 
    } else {
        this.innerHTML = "🌙"; 
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const darkModeEnabled = localStorage.getItem("darkMode") === "true";
    if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
    }
});

function saveTransactionToHistory(amount) {
    const transaction = {
        amount: amount,
        date: new Date().toLocaleString(),
    };

    let transactionHistory = JSON.parse(localStorage.getItem("transactionHistory")) || [];
    transactionHistory.push(transaction);
    localStorage.setItem("transactionHistory", JSON.stringify(transactionHistory));
}

function showTransactionHistory() {
    const transactionHistory = JSON.parse(localStorage.getItem("transactionHistory")) || [];
    const historySection = document.getElementById('transactionHistorySection');
    
    if (transactionHistory.length > 0) {
        let historyContent = '<ul>';
        transactionHistory.forEach(transaction => {
            historyContent += `<li>Amount: Rp ${transaction.amount.toLocaleString()} - Date: ${transaction.date}</li>`;
        });
        historyContent += '</ul>';
        historySection.innerHTML = historyContent;
        historySection.classList.remove('hidden');
    } else {
        historySection.innerHTML = 'Tidak ada riwayat transaksi.';
        historySection.classList.remove('hidden');
    }
}

function detectPromo(nominal) {
    if (nominal > 100000) {
        const discount = nominal * 0.1; 
        return discount;
    }
    return 0; 
}


function updateTotalPriceWithPromo(formId, nominalInputId, totalPriceId) {
    const nominal = parseInt(document.getElementById(nominalInputId).value) || 0;
    const discount = detectPromo(nominal);
    const totalPrice = nominal + adminFee - discount;

    if (nominal > 0) {
        document.getElementById(totalPriceId).innerText = `Rp ${totalPrice.toLocaleString()}`;
        if (discount > 0) {
            alert(`Promo diterapkan! Anda mendapatkan diskon Rp ${discount.toLocaleString()}`);
        }
    } else {
        alert("Mohon isi nominal yang valid.");
    }
}
