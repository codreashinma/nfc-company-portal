document.addEventListener('DOMContentLoaded', function() {
    // ローカルストレージからデータを読み込む
    loadData();

    // 管理パネルの表示/非表示
    const adminBtn = document.getElementById('admin-btn');
    const adminPanel = document.getElementById('admin-panel');
    const closeAdmin = document.getElementById('close-admin');

    adminBtn.addEventListener('click', function() {
        adminPanel.classList.add('active');
    });

    closeAdmin.addEventListener('click', function() {
        adminPanel.classList.remove('active');
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
    // 会社URLの読み込み
    const companyUrl = localStorage.getItem('companyUrl');
    if (companyUrl) {
        updateCompanyUrl(companyUrl);
        document.getElementById('company-url').value = companyUrl;
    }

    // 資料の読み込み
    const materials = getMaterials();
    renderMaterials(materials);
    renderAdminMaterials(materials);
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
