document.addEventListener('DOMContentLoaded', () => {
    const logDiv = document.getElementById("log");
    const clearButton = document.getElementById("clear");

    // 加载对话记录
    chrome.storage.local.get({ chatHistory: [] }, (data) => {
        logDiv.innerHTML = data.chatHistory.map(entry => 
            `<p><strong>${entry.time}:</strong> ${entry.message}</p>`
        ).join('') || "没有检测到对话记录";
    });

    // 清空记录
    clearButton.addEventListener("click", () => {
        chrome.storage.local.set({ chatHistory: [] }, () => {
            logDiv.innerHTML = "记录已清空";
        });
    });
});
