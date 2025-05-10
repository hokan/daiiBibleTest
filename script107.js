console.log("script.js 檔案 is being loaded and executing..."); // ** 新增： 放在 script.js 檔案的最頂端 **

let bibleData; // 宣告 bibleData 變數，用於儲存從 JSON 檔案載入的聖經資料

// 增加複製功能
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            showCopyToast();
        })
        .catch(err => {
            console.error("複製失敗:", err);
            alert("複製失敗：" + text);
        });
}

function showCopyToast() {
    const toast = document.getElementById("copy-toast");
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}

// ===== 宣告變數用於追蹤選中的經文段落 =====
let selectedVerseElement = null;

document.addEventListener('DOMContentLoaded', function() {

    // ** 載入 JSON 聖經資料庫 **
    fetch('bible_data.json') // 使用 fetch API 發送 HTTP GET 請求載入 bible_data.json 檔案
        .then(response => response.json()) // 將 response 物件轉換成 JSON 資料
        .then(data => {
            bibleData = data; // 將解析後的 JSON 資料賦值給 bibleData 變數
            console.log('聖經資料庫載入成功！', bibleData); // 在 console 中輸出成功訊息，並印出 bibleData 物件，方便檢查資料

            // ** 動態產生書卷選單選項 **
            const bookSelect = document.getElementById('book'); // 取得書卷選單元素
            const bookNames = Object.keys(bibleData); // 取得 bibleData 物件的所有書卷名稱 (keys)
            bookNames.forEach(bookName => { // 迴圈遍历书卷名称，动态创建 <option> 元素并添加到 <select> 中
                const option = document.createElement('option');
                option.value = bookName;
                option.textContent = bookName;
                bookSelect.appendChild(option);
            });
            // ** 動態產生書卷選單選項 (結束) **

            // ** 動態產生章節按鈕功能 **
            const chapterButtonsDiv = document.getElementById('chapterButtons'); // 取得章節按鈕容器元素

            console.log("準備設定書卷選單 change 事件監聽器..."); // ** 新增： 記錄準備設定事件監聽器 **

            // ** 書卷選單改變事件監聽器 **
            bookSelect.addEventListener('change', function() {
                console.log("書卷選單 change 事件觸發！", "選取的書卷:", bookSelect.value); // ** 之前新增的 console.log，請保留 **

                chapterButtonsDiv.innerHTML = ''; // 清空章節按鈕容器

                const selectedBook = bookSelect.value; // 取得使用者選擇的書卷
                if (selectedBook) { // 確保有選擇書卷
                    const chapters = bibleData[selectedBook]; // 取得所選書卷的章節資料
                    const chapterNumbers = Object.keys(chapters); // 取得章節數組 (keys)

                    chapterNumbers.forEach(chapterNumber => { // 迴圈遍历章節數
                        const chapterButton = document.createElement('button'); // 創建章節按鈕
                        chapterButton.textContent = chapterNumber; // 按鈕文字為章節數
                        chapterButton.classList.add('chapter-button'); // 添加 CSS 樣式類別 (可選)

                        // ** 章節按鈕點擊事件監聽器 **
                        // 修改章節按鈕的點擊事件處理
                        chapterButton.addEventListener('click', function() {
                            const selectedBook = bookSelect.value;
                            const selectedChapter = chapterButton.textContent;
                            const bibleTextDiv = document.getElementById('bibleText');

                            // 新增：切換章節時重置選中狀態
                            selectedVerseElement = null;
                            bibleTextDiv.innerHTML = ''; 

                            // 只保留一個渲染方式 (移除 displayChapter 或下方的渲染程式碼)
                            if (bibleData[selectedBook] && bibleData[selectedBook][selectedChapter]) {
                                const chapterVerses = bibleData[selectedBook][selectedChapter];
                                let textContent = "";
                                

// 清空舊內容
bibleTextDiv.innerHTML = "";

// 取得目前的書卷與章節
const currentBook = bookSelect.value;
const currentChapter = chapterButton.textContent;



// ===== 動態產生經文段落 =====
chapterVerses.forEach((verse, index) => {
    const verseElement = document.createElement("p");
    verseElement.textContent = verse;

    // ===== 點擊高亮功能 + 更新 selectedVerseElement =====
    verseElement.addEventListener("click", function () {
        // 移除所有段落的 selected 樣式
        bibleTextDiv.querySelectorAll("p").forEach(v => v.classList.remove("selected"));
        // 為當前段落加上 selected 樣式
        verseElement.classList.add("selected");
        // 更新全域變數 selectedVerseElement
        selectedVerseElement = this; // 使用 this 取代 verseElement
    });    

    // ===== 長按複製功能（整合條件）=====
    let longPressTimer;
    let touchStartX, touchStartY;
    let isMoved = false;

    // ===== 修正後的長按複製功能 (最終版) =====
    verseElement.addEventListener("touchstart", function(e) {
        // 強化條件檢查 (使用三重驗證)
        const isHighlighted = (
            selectedVerseElement !== null &&
            this === selectedVerseElement &&
            this.classList.contains('selected')
        );
        
        if (!isHighlighted) {
            console.log('非高亮區域，拒絕處理觸控事件', {
                記錄的元素: selectedVerseElement ? selectedVerseElement.textContent : null,
                當前元素: this.textContent,
                類別狀態: this.classList.contains('selected'),
                isSameElement: this === selectedVerseElement
            });
            return;
        }

        // 單指觸控檢查
        if (e.touches.length !== 1) return;

        // 初始化局部變數
        const touch = e.touches[0];
        let touchStartX = touch.clientX;
        let touchStartY = touch.clientY;
        let isMoved = false;
        let longPressTimer;

        // 滑動檢測函式 (使用 requestAnimationFrame 優化性能)
        const handleMove = (e) => {
            if (!e.touches[0]) return;
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            
            const deltaX = Math.abs(currentX - touchStartX);
            const deltaY = Math.abs(currentY - touchStartY);

            if (deltaX > 5 || deltaY > 5) {
                cancelOperation();
            }
        };

        // 取消操作函式
        const cancelOperation = () => {
            isMoved = true;
            clearTimeout(longPressTimer);
            removeEventListeners();
        };

        // 結束處理函式
        const handleEnd = () => {
            if (!isMoved) {
                console.log('觸控正常結束，未滑動');
            }
            cancelOperation();
        };

        // 清除監聽器 (使用箭頭函式綁定正確的 this)
        const removeEventListeners = () => {
            this.removeEventListener('touchmove', handleMove);
            this.removeEventListener('touchend', handleEnd);
        };

        // 設定計時器 (使用防抖機制)
        longPressTimer = setTimeout(() => {
            if (!isMoved && document.body.contains(this)) {
                const verseNumber = chapterVerses.indexOf(verse) + 1;
                const fullVerse = `${currentBook} ${currentChapter}:${verseNumber} ${verse}`;
                console.log('觸發複製:', fullVerse);
                copyToClipboard(fullVerse);
            }
            removeEventListeners();
        }, 1000);

        // 綁定事件 (使用 passive 改善滾動性能)
        this.addEventListener('touchmove', handleMove, { passive: true });
        this.addEventListener('touchend', handleEnd);
    });



    // ===== 滑鼠右鍵複製功能 =====
    verseElement.addEventListener("contextmenu", (e) => {
        e.preventDefault();

        // 若 selectedVerseElement 為 null（未點擊過任何段落）或非高亮段落 → 不執行複製
        if (selectedVerseElement === null || verseElement !== selectedVerseElement) {
            return;
        }

        const fullVerse = `${currentBook}${verse}`;
        copyToClipboard(fullVerse);
    });

    // 將段落加入 DOM
    bibleTextDiv.appendChild(verseElement);
});

                                  
                            }
                        });

                        chapterButtonsDiv.appendChild(chapterButton); // 將章節按鈕添加到章節按鈕容器
                    });
                }
            });
            // ** 動態產生章節按鈕功能 (結束) **

            // ** 手動觸發一次書卷選單的 change 事件，確保初始載入時章節按鈕能正確產生 **
            bookSelect.dispatchEvent(new Event('change'));


        })
        
        .catch(error => {
            const bibleTextDiv = document.getElementById('bibleText'); // 新增這一行
            console.error('載入 JSON 聖經資料庫錯誤:', error);
            bibleTextDiv.textContent = "載入聖經資料庫錯誤，請檢查 bible_data.json 檔案是否存在或格式是否正確。";
          });
          

        // **`if ('serviceWorker' in navigator)`**:  檢查瀏覽器是否支援 Service Worker API。  如果支援，才執行後續的 Service Worker 註冊程式碼。
        // **`window.addEventListener('load', function() { ... });`**:  確保在網頁完全載入後 (包括所有資源都載入完成)，才註冊 Service Worker。
        // **`navigator.serviceWorker.register('/service-worker.js')`**:  註冊 Service Worker。  `/service-worker.js`  是 Service Worker 檔案的路徑，由於 `service-worker.js` 和 `index.html` 在同一個目錄下，所以路徑為 `/service-worker.js`。
        //  `.then(function(registration) { ... })`:  Service Worker 註冊成功時會執行。  程式碼會在 Console 中輸出成功訊息，包含 Service Worker 的作用範圍 (`registration.scope`)。
        //  `.catch(function(error) { ... })`:  Service Worker 註冊失敗時會執行。  程式碼會在 Console 中輸出錯誤訊息。

        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/service-worker.js')
                .then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(function(error) {
                console.log('ServiceWorker registration failed: ', error);
                });
            });
        }


});