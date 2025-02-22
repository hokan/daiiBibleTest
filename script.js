console.log("script.js 檔案 is being loaded and executing...");

let bibleData;

document.addEventListener('DOMContentLoaded', function() {
    fetch('bible_data.json')
        .then(response => response.json())
        .then(data => {
            bibleData = data;
            console.log('聖經資料庫載入成功！', bibleData);

            const bookSelect = document.getElementById('book');
            const bookNames = Object.keys(bibleData);
            bookNames.forEach(bookName => {
                const option = document.createElement('option');
                option.value = bookName;
                option.textContent = bookName;
                bookSelect.appendChild(option);
            });

            const chapterButtonsDiv = document.getElementById('chapterButtons');
            console.log("準備設定書卷選單 change 事件監聽器...");

            bookSelect.addEventListener('change', function() {
                console.log("書卷選單 change 事件觸發！", "選取的書卷:", bookSelect.value);
                chapterButtonsDiv.innerHTML = '';

                const selectedBook = bookSelect.value;
                if (selectedBook) {
                    const chapters = bibleData[selectedBook];
                    const chapterNumbers = Object.keys(chapters);

                    chapterNumbers.forEach(chapterNumber => {
                        const chapterButton = document.createElement('button');
                        chapterButton.textContent = chapterNumber;
                        chapterButton.classList.add('chapter-button');

                        chapterButton.addEventListener('click', function() {
                            const selectedBook = bookSelect.value;
                            const selectedChapter = chapterButton.textContent;
                            const bibleTextDiv = document.getElementById('bibleText');

                            if (bibleData[selectedBook] && bibleData[selectedBook][selectedChapter]) {
                                const chapterVerses = bibleData[selectedBook][selectedChapter];
                                let textContent = "";
                                chapterVerses.forEach((verse, index) => {
                                    textContent += `<p data-verse="${index + 1}">${verse}</p>`;
                                });
                                bibleTextDiv.innerHTML = textContent;

                                // 綁定事件到經文段落
                                bibleTextDiv.querySelectorAll('p').forEach(verseElement => {
                                    let pressTimer;

                                    // 點擊高亮事件（支援桌面和手機）
                                    verseElement.addEventListener('click', function(e) {
                                        e.preventDefault(); // 防止手機上觸發其他行為
                                        bibleTextDiv.querySelectorAll('p').forEach(v => v.classList.remove('selected'));
                                        verseElement.classList.add('selected');
                                    });

                                    // 滑鼠長按事件（桌面）
                                    verseElement.addEventListener('mousedown', function() {
                                        pressTimer = setTimeout(() => {
                                            copyVerse(verseElement);
                                        }, 1000);
                                    });
                                    verseElement.addEventListener('mouseup', () => clearTimeout(pressTimer));
                                    verseElement.addEventListener('mouseleave', () => clearTimeout(pressTimer));

                                    // 觸控長按事件（手機）
                                    verseElement.addEventListener('touchstart', function(e) {
                                        e.preventDefault(); // 防止觸控時觸發點擊或其他行為
                                        pressTimer = setTimeout(() => {
                                            copyVerse(verseElement);
                                        }, 1000);
                                    });
                                    verseElement.addEventListener('touchend', () => clearTimeout(pressTimer));
                                    verseElement.addEventListener('touchcancel', () => clearTimeout(pressTimer));
                                });
                            }
                        });

                        chapterButtonsDiv.appendChild(chapterButton);
                    });
                }
            });

            bookSelect.dispatchEvent(new Event('change'));
        })
        .catch(error => {
            const bibleTextDiv = document.getElementById('bibleText');
            console.error('載入 JSON 聖經資料庫錯誤:', error);
            bibleTextDiv.textContent = "載入聖經資料庫錯誤，請檢查 bible_data.json 檔案是否存在或格式是否正確。";
        });

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/service-worker.js')
                .then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    // 強制更新 Service Worker 以確保載入最新資源
                    registration.update();
                })
                .catch(function(error) {
                    console.log('ServiceWorker registration failed: ', error);
                });
        });
    }

    // 複製經文的共用函數
    function copyVerse(verseElement) {
        const verseText = verseElement.textContent;
        navigator.clipboard.writeText(verseText)
            .then(() => {
                console.log(`經文已複製到剪貼簿: ${verseText}`);
                showTemporaryMessage("已複製。");
            })
            .catch(err => {
                console.error('複製失敗:', err);
                showTemporaryMessage("複製失敗。");
            });
    }

    // 自訂臨時訊息顯示函數
    function showTemporaryMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '50%';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translate(-50%, -50%)';
        messageDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        messageDiv.style.color = 'white';
        messageDiv.style.padding = '10px 20px';
        messageDiv.style.borderRadius = '5px';
        messageDiv.style.zIndex = '1000';
        document.body.appendChild(messageDiv);

        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 3000);
    }
});