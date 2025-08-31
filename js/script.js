document.addEventListener('DOMContentLoaded', function() {
    // リモートリポジトリのデフォルトカラー設定（白背景）
    const defaultColors = {
        primaryColor: '#00bcd4',
        secondaryColor: '#00838f',
        accentColor: '#00e5ff',
        backgroundColor: '#ffffff',
        cardBgColor: '#f8f9fa'
    };
    
    // このカラー設定がリモートリポジトリの状態
    const REMOTE_DEFAULT_COLORS = JSON.stringify(defaultColors);

    // ローカルストレージからデータを読み込む
    loadData();
    
    // カラー設定を適用
    applyColorTheme();

    // 管理パネルの表示/非表示
    const adminBtn = document.getElementById('admin-btn');
    const adminPanel = document.getElementById('admin-panel');
    const closeAdmin = document.getElementById('close-admin');

    adminBtn.addEventListener('click', function() {
        adminPanel.classList.add('active');
    });

    closeAdmin.addEventListener('click', function() {
        adminPanel.classList.remove('active');
        // ログイン画面をリセット
        document.getElementById('admin-login').style.display = 'block';
        document.getElementById('admin-content').style.display = 'none';
        document.getElementById('admin-password').value = '';
        document.getElementById('login-error').textContent = '';
    });

    // 管理者ログイン
    const loginBtn = document.getElementById('login-btn');
    loginBtn.addEventListener('click', function() {
        const password = document.getElementById('admin-password').value;
        const storedPassword = localStorage.getItem('adminPassword');
        
        // デフォルトパスワードは「admin」、または設定済みのパスワード
        const correctPassword = storedPassword || 'admin';
        
        if (password === correctPassword) {
            document.getElementById('admin-login').style.display = 'none';
            document.getElementById('admin-content').style.display = 'block';
            document.getElementById('login-error').textContent = '';
        } else {
            document.getElementById('login-error').textContent = 'パスワードが正しくありません';
        }
    });

    // パスワード変更
    const changePasswordBtn = document.getElementById('change-password');
    changePasswordBtn.addEventListener('click', function() {
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
        showNotification('パスワードを変更しました');
    });

    // ロゴ追加ボタン
    const addLogoBtn = document.getElementById('add-logo-btn');
    addLogoBtn.addEventListener('click', function() {
        addLogoForm();
    });

    // ロゴ保存ボタン
    const saveLogosBtn = document.getElementById('save-logos');
    saveLogosBtn.addEventListener('click', function() {
        saveLogos();
    });
    
    // カラー設定の保存
    const saveColorsBtn = document.getElementById('save-colors');
    saveColorsBtn.addEventListener('click', function() {
        saveColorTheme();
    });
    
    // カラー設定をデフォルトに戻す
    const resetColorsBtn = document.getElementById('reset-colors');
    resetColorsBtn.addEventListener('click', function() {
        resetColorTheme();
    });
    
    // カラーピッカーの変更時にリアルタイムプレビュー
    document.querySelectorAll('.color-picker').forEach(picker => {
        picker.addEventListener('input', function() {
            previewColorTheme();
        });
    });
    
    // 設定ファイルのエクスポート
    const exportConfigBtn = document.getElementById('export-config');
    exportConfigBtn.addEventListener('click', function() {
        exportConfig();
    });

    // 会社URLの保存
    const saveCompanyUrlBtn = document.getElementById('save-company-url');
    saveCompanyUrlBtn.addEventListener('click', function() {
        const companyUrl = document.getElementById('company-url').value;
        if (companyUrl) {
            localStorage.setItem('companyUrl', companyUrl);
            updateCompanyUrl(companyUrl);
            showNotification('会社URLを保存しました');
        } else {
            showNotification('URLを入力してください', 'error');
        }
    });

    // 資料の追加
    const addMaterialBtn = document.getElementById('add-material');
    addMaterialBtn.addEventListener('click', function() {
        const title = document.getElementById('material-title').value;
        const url = document.getElementById('material-url').value;
        const type = document.getElementById('material-type').value;

        if (title && url) {
            addMaterial(title, url, type);
            document.getElementById('material-title').value = '';
            document.getElementById('material-url').value = '';
            showNotification('資料を追加しました');
        } else {
            showNotification('タイトルとURLを入力してください', 'error');
        }
    });

    // 初期データがない場合はデモデータを設定
    initializeDefaultData();
});

// データの読み込み
function loadData() {
    // 設定ファイルを読み込む
    fetch('config.json')
        .then(response => response.json())
        .then(config => {
            // 設定ファイルから読み込んだデータを適用
            
            // ロゴの読み込み
            if (config.logoSettings && config.logoSettings.length > 0) {
                renderLogos(config.logoSettings);
                renderLogoForms(config.logoSettings);
                updateLogoPreview(config.logoSettings);
            }
            
            // 会社URLの読み込み
            if (config.companyUrl) {
                updateCompanyUrl(config.companyUrl);
                document.getElementById('company-url').value = config.companyUrl;
            }
            
            // 資料の読み込み
            if (config.materials && config.materials.length > 0) {
                renderMaterials(config.materials);
                renderAdminMaterials(config.materials);
            }
            
            // ローカルストレージの設定があれば、それを優先して適用（管理者用）
            applyLocalStorageSettings();
        })
        .catch(error => {
            console.error('設定ファイルの読み込みに失敗しました:', error);
            // 設定ファイルが読み込めない場合は、ローカルストレージのデータを使用
            applyLocalStorageSettings();
        });

    // カラー設定の読み込み
    const colorThemeJson = localStorage.getItem('colorTheme');
    if (colorThemeJson) {
        const colorTheme = JSON.parse(colorThemeJson);
        loadColorPickers(colorTheme);
    } else {
        // リモートリポジトリのデフォルト設定を使用
        loadColorPickers(JSON.parse(REMOTE_DEFAULT_COLORS));
    }
}

// ローカルストレージの設定を適用（管理者用）
function applyLocalStorageSettings() {
    // ロゴの読み込み
    const logosJson = localStorage.getItem('logos');
    if (logosJson) {
        const logos = JSON.parse(logosJson);
        renderLogos(logos);
        renderLogoForms(logos);
        updateLogoPreview(logos);
    } else {
        // 後方互換性のため、古い形式のロゴ設定があれば変換
        const oldLogoSettingsJson = localStorage.getItem('logoSettings');
        if (oldLogoSettingsJson) {
            const oldSettings = JSON.parse(oldLogoSettingsJson);
            const newLogos = [{
                id: Date.now().toString(),
                url: oldSettings.url,
                width: oldSettings.width,
                height: oldSettings.height,
                position: oldSettings.position || 'center'
            }];
            localStorage.setItem('logos', JSON.stringify(newLogos));
            renderLogos(newLogos);
            renderLogoForms(newLogos);
            updateLogoPreview(newLogos);
            
            // 古い設定を削除
            localStorage.removeItem('logoSettings');
        }
    }

    // 会社URLの読み込み
    const companyUrl = localStorage.getItem('companyUrl');
    if (companyUrl) {
        updateCompanyUrl(companyUrl);
        document.getElementById('company-url').value = companyUrl;
    }

    // 資料の読み込み
    const materials = getMaterials();
    if (materials.length > 0) {
        renderMaterials(materials);
        renderAdminMaterials(materials);
    }
}

// ロゴフォームを追加
function addLogoForm(logo = null) {
    const logosContainer = document.getElementById('logos-container');
    const logoId = logo ? logo.id : Date.now().toString();
    
    const logoForm = document.createElement('div');
    logoForm.className = 'logo-form';
    logoForm.dataset.id = logoId;
    
    logoForm.innerHTML = `
        <div class="logo-form-header">
            <span class="logo-form-title">ロゴ設定</span>
        </div>
        <input type="text" class="logo-url" placeholder="ロゴ画像のURL" value="${logo ? logo.url : ''}">
        
        <div class="logo-settings">
            <div class="setting-group">
                <label>幅 (px)</label>
                <input type="number" class="logo-width" min="50" max="300" placeholder="幅" value="${logo && logo.width ? logo.width : ''}">
            </div>
            <div class="setting-group">
                <label>高さ (px)</label>
                <input type="number" class="logo-height" min="30" max="200" placeholder="高さ" value="${logo && logo.height ? logo.height : ''}">
            </div>
            <div class="setting-group">
                <label>位置</label>
                <select class="logo-position">
                    <option value="left" ${logo && logo.position === 'left' ? 'selected' : ''}>左寄せ</option>
                    <option value="center" ${!logo || logo.position === 'center' ? 'selected' : ''}>中央</option>
                    <option value="right" ${logo && logo.position === 'right' ? 'selected' : ''}>右寄せ</option>
                </select>
            </div>
        </div>
        
        <button class="remove-logo-btn" data-id="${logoId}"><i class="fas fa-trash"></i></button>
    `;
    
    logosContainer.appendChild(logoForm);
    
    // 削除ボタンのイベントリスナー
    logoForm.querySelector('.remove-logo-btn').addEventListener('click', function() {
        logoForm.remove();
        updateLogoPreview(collectLogoData());
    });
    
    // フォーム入力時にプレビューを更新
    const inputs = logoForm.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            updateLogoPreview(collectLogoData());
        });
    });
    
    // プレビュー更新
    updateLogoPreview(collectLogoData());
}

// フォームからロゴデータを収集
function collectLogoData() {
    const logoForms = document.querySelectorAll('.logo-form');
    const logos = [];
    
    logoForms.forEach(form => {
        const id = form.dataset.id;
        const url = form.querySelector('.logo-url').value;
        const width = form.querySelector('.logo-width').value;
        const height = form.querySelector('.logo-height').value;
        const position = form.querySelector('.logo-position').value;
        
        if (url) {
            logos.push({
                id: id,
                url: url,
                width: width || null,
                height: height || null,
                position: position || 'center'
            });
        }
    });
    
    return logos;
}

// ロゴ設定を保存
function saveLogos() {
    const logos = collectLogoData();
    
    if (logos.length > 0) {
        localStorage.setItem('logos', JSON.stringify(logos));
        renderLogos(logos);
        showNotification('ロゴを保存しました');
    } else {
        localStorage.removeItem('logos');
        resetLogos();
        showNotification('ロゴをリセットしました');
    }
}

// プレビューを更新
function updateLogoPreview(logos) {
    const previewArea = document.querySelector('#logos-preview .preview-area');
    previewArea.innerHTML = '';
    
    if (logos.length === 0) {
        previewArea.innerHTML = '<div class="logo-placeholder"><i class="fas fa-building"></i></div>';
        return;
    }
    
    logos.forEach(logo => {
        if (logo.url) {
            const previewLogo = document.createElement('div');
            previewLogo.className = 'preview-logo';
            
            let style = '';
            if (logo.width) style += `width: ${logo.width}px; `;
            if (logo.height) style += `height: ${logo.height}px; `;
            
            previewLogo.innerHTML = `<img src="${logo.url}" alt="ロゴプレビュー" style="${style}">`;
            previewArea.appendChild(previewLogo);
        }
    });
}

// 保存されているロゴフォームを描画
function renderLogoForms(logos) {
    const logosContainer = document.getElementById('logos-container');
    logosContainer.innerHTML = '';
    
    if (logos.length === 0) {
        addLogoForm(); // 空のフォームを1つ追加
    } else {
        logos.forEach(logo => {
            addLogoForm(logo);
        });
    }
}

// メイン画面にロゴを描画
function renderLogos(logos) {
    const logoArea = document.getElementById('logo-area');
    logoArea.innerHTML = '';
    
    if (logos.length === 0) {
        logoArea.innerHTML = `
            <div class="logo-placeholder">
                <i class="fas fa-building"></i>
            </div>
        `;
        return;
    }
    
    logos.forEach(logo => {
        const logoItem = document.createElement('div');
        logoItem.className = 'logo-item';
        
        let style = '';
        if (logo.width) style += `width: ${logo.width}px; `;
        if (logo.height) style += `height: ${logo.height}px; `;
        
        logoItem.innerHTML = `<img src="${logo.url}" alt="会社ロゴ" style="${style}">`;
        logoArea.appendChild(logoItem);
    });
    
    // ロゴエリア全体の位置調整
    const positions = logos.map(logo => logo.position);
    // 最も多い位置を採用
    const position = positions.sort((a, b) => 
        positions.filter(p => p === a).length - positions.filter(p => p === b).length
    ).pop() || 'center';
    
    logoArea.style.justifyContent = 
        position === 'left' ? 'flex-start' : 
        position === 'right' ? 'flex-end' : 'center';
}

// ロゴをリセット
function resetLogos() {
    const logoArea = document.getElementById('logo-area');
    logoArea.style.justifyContent = 'center';
    
    logoArea.innerHTML = `
        <div class="logo-placeholder">
            <i class="fas fa-building"></i>
        </div>
    `;
    
    // フォームを初期化
    document.getElementById('logos-container').innerHTML = '';
    addLogoForm();
    
    // プレビューをリセット
    const previewArea = document.querySelector('#logos-preview .preview-area');
    previewArea.innerHTML = '<div class="logo-placeholder"><i class="fas fa-building"></i></div>';
}

// 会社URLの更新
function updateCompanyUrl(url) {
    const companyWebsite = document.getElementById('company-website');
    companyWebsite.href = url;
}

// 資料の取得
function getMaterials() {
    const materialsJson = localStorage.getItem('materials');
    return materialsJson ? JSON.parse(materialsJson) : [];
}

// 資料の保存
function saveMaterials(materials) {
    localStorage.setItem('materials', JSON.stringify(materials));
}

// 資料の追加
function addMaterial(title, url, type) {
    const materials = getMaterials();
    const newMaterial = {
        id: Date.now().toString(), // ユニークIDを生成
        title: title,
        url: url,
        type: type
    };
    
    materials.push(newMaterial);
    saveMaterials(materials);
    
    // UIを更新
    renderMaterials(materials);
    renderAdminMaterials(materials);
}

// 資料の削除
function deleteMaterial(id) {
    let materials = getMaterials();
    materials = materials.filter(material => material.id !== id);
    saveMaterials(materials);
    
    // UIを更新
    renderMaterials(materials);
    renderAdminMaterials(materials);
    
    showNotification('資料を削除しました');
}

// メイン画面の資料リストを描画
function renderMaterials(materials) {
    const materialsList = document.getElementById('materials-list');
    materialsList.innerHTML = '';
    
    if (materials.length === 0) {
        materialsList.innerHTML = '<p class="no-materials">資料がまだ登録されていません。管理パネルから追加してください。</p>';
        return;
    }
    
    materials.forEach((material, index) => {
        const materialCard = document.createElement('div');
        materialCard.className = 'material-card';
        materialCard.style.animationDelay = `${index * 0.1}s`;
        
        const icon = material.type === 'pdf' ? 'fa-file-pdf' : 'fa-link';
        
        materialCard.innerHTML = `
            <div class="material-icon">
                <i class="fas ${icon}"></i>
            </div>
            <h3 class="material-title">${material.title}</h3>
            <a href="${material.url}" class="btn btn-secondary" target="_blank">
                <i class="fas fa-external-link-alt"></i> ${material.type === 'pdf' ? 'PDFを表示' : '資料を開く'}
            </a>
        `;
        
        materialsList.appendChild(materialCard);
    });
}

// 管理パネルの資料リストを描画
function renderAdminMaterials(materials) {
    const adminMaterialsList = document.getElementById('admin-materials-list');
    adminMaterialsList.innerHTML = '';
    
    materials.forEach(material => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${material.title}</span>
            <button class="btn-delete" data-id="${material.id}">削除</button>
        `;
        
        adminMaterialsList.appendChild(li);
    });
    
    // 削除ボタンのイベントリスナーを追加
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            deleteMaterial(id);
        });
    });
}

// 通知を表示
function showNotification(message, type = 'success') {
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

// カラー設定関連の関数
function loadColorPickers(colors) {
    // カラーピッカーに値をセット
    document.getElementById('primary-color').value = colors.primaryColor;
    document.getElementById('accent-color').value = colors.accentColor;
    document.getElementById('background-color').value = colors.backgroundColor;
    document.getElementById('card-bg-color').value = colors.cardBgColor;
}

function collectColorData() {
    return {
        primaryColor: document.getElementById('primary-color').value,
        accentColor: document.getElementById('accent-color').value,
        backgroundColor: document.getElementById('background-color').value,
        cardBgColor: document.getElementById('card-bg-color').value
    };
}

function saveColorTheme() {
    const colors = collectColorData();
    localStorage.setItem('colorTheme', JSON.stringify(colors));
    applyColorTheme(colors);
    showNotification('カラー設定を保存しました');
}

function resetColorTheme() {
    // リモートリポジトリのデフォルト設定を使用
    const remoteDefaultColors = JSON.parse(REMOTE_DEFAULT_COLORS);
    
    loadColorPickers(remoteDefaultColors);
    localStorage.removeItem('colorTheme');
    applyColorTheme(remoteDefaultColors);
    showNotification('カラー設定をリモートリポジトリのデフォルト状態にリセットしました');
}

function previewColorTheme() {
    const colors = collectColorData();
    applyColorTheme(colors, true);
}

function applyColorTheme(colors = null) {
    if (!colors) {
        const colorThemeJson = localStorage.getItem('colorTheme');
        if (colorThemeJson) {
            colors = JSON.parse(colorThemeJson);
        } else {
            // リモートリポジトリのデフォルト設定を使用
            colors = JSON.parse(REMOTE_DEFAULT_COLORS);
        }
    }
    
    // CSSカスタムプロパティを更新
    document.documentElement.style.setProperty('--primary-color', colors.primaryColor);
    document.documentElement.style.setProperty('--accent-color', colors.accentColor);
    document.documentElement.style.setProperty('--background', colors.backgroundColor);
    document.documentElement.style.setProperty('--card-bg', colors.cardBgColor);
    
    // 派生カラーも更新
    const primaryColorDarker = adjustColor(colors.primaryColor, -20);
    document.documentElement.style.setProperty('--secondary-color', primaryColorDarker);
    
    // テキストカラーは背景に応じて自動調整
    const isLightBackground = isLightColor(colors.backgroundColor);
    document.documentElement.style.setProperty('--text-color', isLightBackground ? '#333333' : '#e0e0e0');
    document.documentElement.style.setProperty('--light-text', isLightBackground ? '#666666' : '#9e9e9e');
    document.documentElement.style.setProperty('--border-color', isLightBackground ? '#dddddd' : '#333333');
    document.documentElement.style.setProperty('--header-bg', isLightBackground ? '#f8f9fa' : '#0a0a0a');
    document.documentElement.style.setProperty('--input-bg', isLightBackground ? '#ffffff' : '#2c2c2c');
}

// 色の明るさを調整する関数
function adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    const newR = Math.max(0, Math.min(255, r + amount));
    const newG = Math.max(0, Math.min(255, g + amount));
    const newB = Math.max(0, Math.min(255, b + amount));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// 色が明るいかどうかを判定する関数
function isLightColor(color) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // YIQ方式で輝度を計算
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128;
}

// 設定ファイルのエクスポート
function exportConfig() {
    // 現在の設定を収集
    const config = {
        companyUrl: document.getElementById('company-url').value,
        materials: getMaterials(),
        logoSettings: collectLogoData()
    };
    
    // JSON形式に変換
    const configJson = JSON.stringify(config, null, 2);
    
    // テキストエリアに表示
    const configTextarea = document.getElementById('config-json');
    configTextarea.value = configJson;
    
    // 結果を表示
    document.getElementById('export-result').style.display = 'block';
    
    // 選択状態にしてコピーしやすくする
    configTextarea.select();
    
    showNotification('設定をエクスポートしました。JSONをコピーしてconfig.jsonとして保存してください。');
}

// デフォルトデータの初期化（初回のみ）
function initializeDefaultData() {
    const companyUrl = localStorage.getItem('companyUrl');
    const materials = getMaterials();
    
    // データがなければデモデータを設定
    if (!companyUrl && materials.length === 0) {
        localStorage.setItem('companyUrl', 'https://example.com');
        
        const demoMaterials = [
            {
                id: '1',
                title: '会社概要資料',
                url: 'https://example.com/company-profile.pdf',
                type: 'pdf'
            },
            {
                id: '2',
                title: 'サービス紹介',
                url: 'https://example.com/services',
                type: 'link'
            }
        ];
        
        saveMaterials(demoMaterials);
        loadData(); // データを再読み込み
    }
}

// 通知用のCSSを動的に追加
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        z-index: 1100;
    }
    
    .notification.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    .notification.success {
        background-color: #2ecc71;
    }
    
    .notification.error {
        background-color: #e74c3c;
    }
`;

document.head.appendChild(notificationStyle);