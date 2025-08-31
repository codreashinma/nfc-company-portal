// 管理パネルの表示問題を修正するスクリプト
document.addEventListener('DOMContentLoaded', function() {
    console.log('fix-admin.js が読み込まれました');
    
    // 管理パネルの表示/非表示
    const adminBtn = document.getElementById('admin-btn');
    const adminPanel = document.getElementById('admin-panel');
    
    if (adminBtn && adminPanel) {
        console.log('管理ボタンと管理パネルを検出しました');
        
        // イベントリスナーを再設定
        adminBtn.addEventListener('click', function(e) {
            console.log('管理ボタンがクリックされました');
            e.preventDefault();
            adminPanel.classList.add('active');
        });
        
        // 閉じるボタンのイベントリスナーも再設定
        const closeAdmin = document.getElementById('close-admin');
        if (closeAdmin) {
            closeAdmin.addEventListener('click', function() {
                console.log('閉じるボタンがクリックされました');
                adminPanel.classList.remove('active');
                // ログイン画面をリセット
                const adminLogin = document.getElementById('admin-login');
                const adminContent = document.getElementById('admin-content');
                const adminPassword = document.getElementById('admin-password');
                const loginError = document.getElementById('login-error');
                
                if (adminLogin) adminLogin.style.display = 'block';
                if (adminContent) adminContent.style.display = 'none';
                if (adminPassword) adminPassword.value = '';
                if (loginError) loginError.textContent = '';
            });
        }
        
        // ログインボタンのイベントリスナーを再設定
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            console.log('ログインボタンを検出しました');
            
            loginBtn.addEventListener('click', function() {
                console.log('ログインボタンがクリックされました');
                
                const password = document.getElementById('admin-password').value;
                const storedPassword = localStorage.getItem('adminPassword');
                
                // デフォルトパスワードは「admin」、または設定済みのパスワード
                const correctPassword = storedPassword || 'admin';
                
                console.log('入力されたパスワード:', password);
                console.log('正しいパスワード:', correctPassword);
                
                if (password === correctPassword) {
                    console.log('パスワードが一致しました');
                    document.getElementById('admin-login').style.display = 'none';
                    document.getElementById('admin-content').style.display = 'block';
                    document.getElementById('login-error').textContent = '';
                } else {
                    console.log('パスワードが一致しません');
                    document.getElementById('login-error').textContent = 'パスワードが正しくありません';
                }
            });
        } else {
            console.error('ログインボタンが見つかりません');
        }
        
        // 他の管理パネル内のボタンも再設定
        setupAdminPanelButtons();
    } else {
        console.error('管理ボタンまたは管理パネルが見つかりません');
    }
});

// 管理パネル内の他のボタンのイベントリスナーを設定
function setupAdminPanelButtons() {
    // 会社URLの保存
    const saveCompanyUrlBtn = document.getElementById('save-company-url');
    if (saveCompanyUrlBtn) {
        saveCompanyUrlBtn.addEventListener('click', function() {
            console.log('会社URL保存ボタンがクリックされました');
            const companyUrl = document.getElementById('company-url').value;
            if (companyUrl) {
                localStorage.setItem('companyUrl', companyUrl);
                // script.jsのupdateCompanyUrl関数を呼び出す
                if (typeof updateCompanyUrl === 'function') {
                    updateCompanyUrl(companyUrl);
                }
                showCustomNotification('会社URLを保存しました');
            } else {
                showCustomNotification('URLを入力してください', 'error');
            }
        });
    }
    
    // 資料の追加
    const addMaterialBtn = document.getElementById('add-material');
    if (addMaterialBtn) {
        addMaterialBtn.addEventListener('click', function() {
            console.log('資料追加ボタンがクリックされました');
            const title = document.getElementById('material-title').value;
            const url = document.getElementById('material-url').value;
            const type = document.getElementById('material-type').value;

            if (title && url) {
                // script.jsのaddMaterial関数を呼び出す
                if (typeof addMaterial === 'function') {
                    addMaterial(title, url, type);
                }
                document.getElementById('material-title').value = '';
                document.getElementById('material-url').value = '';
                showCustomNotification('資料を追加しました');
            } else {
                showCustomNotification('タイトルとURLを入力してください', 'error');
            }
        });
    }
    
    // カラー設定の保存
    const saveColorsBtn = document.getElementById('save-colors');
    if (saveColorsBtn) {
        saveColorsBtn.addEventListener('click', function() {
            console.log('カラー設定保存ボタンがクリックされました');
            if (typeof saveColorTheme === 'function') {
                saveColorTheme();
            }
        });
    }
    
    // カラー設定のリセット
    const resetColorsBtn = document.getElementById('reset-colors');
    if (resetColorsBtn) {
        resetColorsBtn.addEventListener('click', function() {
            console.log('カラー設定リセットボタンがクリックされました');
            if (typeof resetColorTheme === 'function') {
                resetColorTheme();
            }
        });
    }
    
    // 設定ファイルのエクスポート
    const exportConfigBtn = document.getElementById('export-config');
    if (exportConfigBtn) {
        exportConfigBtn.addEventListener('click', function() {
            console.log('設定エクスポートボタンがクリックされました');
            if (typeof exportConfig === 'function') {
                exportConfig();
            }
        });
    }
    
    // パスワード変更
    const changePasswordBtn = document.getElementById('change-password');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function() {
            console.log('パスワード変更ボタンがクリックされました');
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (!newPassword) {
                document.getElementById('password-error').textContent = '新しいパスワードを入力してください';
                return;
            }
            
            if (newPassword !== confirmPassword) {
                document.getElementById('password-error').textContent = 'パスワードが一致しません';
                return;
            }
            
            localStorage.setItem('adminPassword', newPassword);
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
            document.getElementById('password-error').textContent = '';
            showCustomNotification('パスワードを変更しました');
        });
    }
}

// 通知を表示する関数
function showCustomNotification(message, type = 'success') {
    console.log('通知:', message, type);
    
    // すでに通知があれば削除
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // アニメーション
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 3秒後に消える
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}