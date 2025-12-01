console.log("script.js 檔案 is being loaded and executing..."); // ** 新增： 放在 script.js 檔案的最頂端 **

let bibleData; // 宣告 bibleData 變數，用於儲存從 JSON 檔案載入的聖經資料

document.addEventListener('DOMContentLoaded', function() {

    // ** 載入 JSON 聖經資料庫 **
    fetch('bible_data251130b.json') // 使用 fetch API 發送 HTTP GET 請求載入 bible_data.json 檔案
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
                            //*0619* const selectedBook = bookSelect.value;
                            const selectedChapter = chapterButton.textContent;
                            const bibleTextDiv = document.getElementById('bibleText');

                            // 只保留一個渲染方式 (移除 displayChapter 或下方的渲染程式碼)
                            if (bibleData[selectedBook] && bibleData[selectedBook][selectedChapter]) {
                                const chapterVerses = bibleData[selectedBook][selectedChapter];
                                let textContent = "";
                                chapterVerses.forEach(verse => {
                                    textContent += `<p>${verse}</p>`;
                                });
                                bibleTextDiv.innerHTML = textContent;

/*                                // 綁定點擊事件到新生成的經文段落
                                bibleTextDiv.querySelectorAll('p').forEach(verseElement => {
                                    verseElement.addEventListener('click', function() {
                                      // 重新查詢所有經文段落，避免閉包問題
                                      bibleTextDiv.querySelectorAll('p').forEach(v => v.classList.remove('selected'));
                                      verseElement.classList.add('selected');
                                    });
                                });
*/
                                // 建立提示視窗元素（只加一次）
                                let copyToast = document.getElementById('copy-toast');
                                if (!copyToast) {
                                    copyToast = document.createElement('div');
                                    copyToast.id = 'copy-toast';
                                    copyToast.textContent = '已複製';
                                    document.body.appendChild(copyToast);
                                }
/*
                                // 綁定點擊事件到新生成的經文段落
                                bibleTextDiv.querySelectorAll('p').forEach(verseElement => {
                                    verseElement.addEventListener('click', function() {
                                        // 檢查被點擊的經文是否已經是 'selected' 狀態
                                        const isAlreadySelected = verseElement.classList.contains('selected');

                                        // 先移除所有經文的 'selected' class，確保單選的行為
                                        bibleTextDiv.querySelectorAll('p').forEach(v => v.classList.remove('selected'));

                                        // 如果被點擊的經文原本沒有被選中，才將它加上 'selected' class
                                        // 如果它原本已經被選中，那在上面移除後，這裡就不會再加回去，達成取消高亮的效果
                                        if (!isAlreadySelected) {
                                            verseElement.classList.add('selected');
                                        }
                                    });
                                });
*/        
                                // 綁定每一節經文的點擊與長按事件
                                bibleTextDiv.querySelectorAll('p').forEach(verseElement => {
                                    verseElement.addEventListener('click', function () {
                                        const isAlreadySelected = verseElement.classList.contains('selected');
                                        bibleTextDiv.querySelectorAll('p').forEach(v => v.classList.remove('selected'));
                                        if (!isAlreadySelected) {
                                            verseElement.classList.add('selected');
                                        }
                                    });

                                    let longPressTimer;
                                    const startLongPress = () => {
                                        if (!verseElement.classList.contains('selected')) return;
                                        longPressTimer = setTimeout(() => {
                                            const text = verseElement.textContent.trim();
                                            navigator.clipboard.writeText(text).then(() => {
                                                copyToast.style.display = 'block';
                                                setTimeout(() => {
                                                    copyToast.style.display = 'none';
                                                }, 2000);
                                            });
                                        }, 600); // 600ms 長按觸發
                                    };
                                    const cancelLongPress = () => clearTimeout(longPressTimer);

                                    // 桌機滑鼠支援
                                    verseElement.addEventListener('mousedown', startLongPress);
                                    verseElement.addEventListener('mouseup', cancelLongPress);
                                    verseElement.addEventListener('mouseleave', cancelLongPress);

                                    // 手機觸控支援
                                    verseElement.addEventListener('touchstart', startLongPress);
                                    verseElement.addEventListener('touchend', cancelLongPress);
                                    verseElement.addEventListener('touchmove', cancelLongPress);
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