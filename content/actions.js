export async function handleExportAllClick() {
  try {
    chrome.runtime.sendMessage({ type: 'EXPORT_DNS' }, (response) => {
      if (response?.status === 'done') {
        console.log('DNS Export Complete');
      } else if (response?.status === 'error') {
        console.error('DNS Export Failed:', response.message);
      }
    });

    

//    chrome.runtime.sendMessage({
//      type: "EXPORT_SUCCESS",
//      payload: {
//        status: "done",
//        time: new Date(),
//        size: JSON.stringify(data).length,
//      },
//    });

    alert("DNS export completed!");
  } catch (err) {
//    chrome.runtime.sendMessage({
//      type: "EXPORT_ERROR",
//      payload: { message: err.message, time: new Date() },
//    });
    alert(`Export failed: ${err.message}`);
  }
}

export function handleExportSelectClick() {
  alert("Feature coming soon.");
}

export function toggleDropdown(dropdown) {
  dropdown.classList.toggle("active");
}

export function closeDropdown(dropdown) {
  dropdown.classList.remove("active");
}
