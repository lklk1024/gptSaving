chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ changes: [] });
    console.log("网页监控插件已安装，数据存储已初始化。");
});
