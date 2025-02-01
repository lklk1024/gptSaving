console.log("ChatGPT 监控插件已启动");

// 确保当前页面是 ChatGPT
if (window.location.hostname === "chatgpt.com") {
    console.log("正在监听 ChatGPT 的对话变化...");

    function getChatContainer() {
        return document.querySelector('[data-testid="conversation-turns"]') || document.body;
    }

    // 监听对话区域变化
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const textContent = node.textContent?.trim();
                        if (textContent) {
                            const changeInfo = {
                                time: new Date().toLocaleString(),
                                message: textContent // 不在这里处理换行
                            };

                            console.log("检测到 ChatGPT 新消息：", changeInfo);

                            try {
                                chrome.storage.local.get({ chatHistory: [] }, (data) => {
                                    // 检查chrome.runtime.lastError以确保扩展程序上下文仍然有效
                                    if (chrome.runtime.lastError) {
                                        console.error('扩展程序上下文无效:', chrome.runtime.lastError);
                                        return;
                                    }
                                    
                                    const chatHistory = data.chatHistory;
                                    chatHistory.push(changeInfo);
                                    chrome.storage.local.set({ chatHistory }, () => {
                                        if (chrome.runtime.lastError) {
                                            console.error('存储数据时发生错误:', chrome.runtime.lastError);
                                        }
                                    });
                                });
                            } catch (error) {
                                console.error('存储操作失败:', error);
                            }
                        }
                    }
                });
            }
        });
    });

    // 绑定观察器
    const chatContainer = getChatContainer();
    if (chatContainer) {
        observer.observe(chatContainer, { childList: true, subtree: true });
        console.log("已成功绑定监听器！");
    } else {
        console.warn("未找到对话容器，可能需要调整选择器！");
    }

    // === 添加"导出记录"按钮 ===
    function createExportButton() {
        if (document.getElementById("export-chat-btn")) return;

        const exportButton = document.createElement("button");
        exportButton.id = "export-chat-btn";
        exportButton.textContent = "导出聊天记录";
        exportButton.style.position = "fixed";
        exportButton.style.bottom = "20px";
        exportButton.style.right = "20px";
        exportButton.style.padding = "10px";
        exportButton.style.backgroundColor = "#28a745";
        exportButton.style.color = "white";
        exportButton.style.border = "none";
        exportButton.style.borderRadius = "5px";
        exportButton.style.cursor = "pointer";
        exportButton.style.zIndex = "1000";

        exportButton.onclick = () => {
            chrome.storage.local.get({ chatHistory: [] }, (data) => {
                if (data.chatHistory.length === 0) {
                    alert("没有可导出的聊天记录");
                    return;
                }
        
                let htmlContent = `
                <!DOCTYPE html>
                <html lang="zh">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>ChatGPT 聊天记录</title>
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 800px; margin: auto; padding: 20px; }
                        .message { padding: 10px; border-radius: 5px; margin: 5px 0; }
                        .user { background-color: #d1ecf1; }
                        .chatgpt { background-color: #f8d7da; }
                    </style>
                </head>
                <body>
                    <h2>ChatGPT 聊天记录</h2>
                    <p><strong>日期：</strong>${new Date().toLocaleString()}</p>
                `;
        
                data.chatHistory.forEach(item => {
                    htmlContent += `
                    <div class="message ${item.role === "user" ? "user" : "chatgpt"}">
                        <strong>${item.role === "user" ? "👤 用户" : "🤖 ChatGPT"}：</strong> ${item.message.replace(/\n/g, "<br>")}
                    </div>
                    `;
                });
        
                htmlContent += `</body></html>`;
        
                const blob = new Blob([htmlContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `chatgpt_chat_log_${new Date().toISOString().replace(/[:.]/g, "-")}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
        
                chrome.storage.local.set({ chatHistory: [] }, () => {
                    alert("聊天记录已导出为 HTML，并已清空！");
                });
            });
        };
        

        document.body.appendChild(exportButton);
    }

    createExportButton(); // 创建按钮
} else {
    console.log("当前页面不是 ChatGPT，不进行监控。");
}
