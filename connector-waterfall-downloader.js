const enviroment = document.querySelector("#profile_legend_profile").innerText;
const utk = new URLSearchParams(document.location.search).get("utk");

document.querySelectorAll("[class*=actions_accordion_list__ActionGroup]").forEach((item) => {
  const header = item.querySelector("[class*=actions_accordion_list__ActionsAccordionGroupHeader]");
  const actions = header.closest("[class*=actions_accordion_list__ActionGroup]").querySelectorAll(".as-accordion-instance");
  const connector_id = header.getAttribute("name").split("connector-")[1];

  actions.forEach((action) => {
    const action_name = action.querySelector("[data-test='accordion_header_action_sub_label']").innerHTML;
    const action_id = action.getAttribute("data-id");

    const section1 = action.querySelector(".section-1");
    const button = document.createElement("button");
    button.textContent = "CSV";

    button.addEventListener("click", () => {
      // Prompt user for date range
      const startDate = prompt("Enter start date (YYYY-MM-DD):", "2024-11-16");
      const endDate = prompt("Enter end date (YYYY-MM-DD):", "2024-12-17");

      if (startDate && endDate) {
        const dateRange = [new Date(startDate).toISOString(), new Date(endDate).toISOString()];
        const request_url = `https://sso.tealiumiq.com/urest/datacloud/ctm/${enviroment}/audit/${connector_id}/${action_id}?utk=${utk}&start=${dateRange[0]}&end=${dateRange[1]}`;
        
        downloadCSV(request_url, action_name);
      } else {
        alert("Please enter valid dates.");
      }
    });

    section1.prepend(button);
  });
});

async function downloadCSV(url, action_name) {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      // Add the "action_name" column to the data
      const dataWithActionName = data.map((item) => ({
        action_name,
        ...item,
      }));

      // Convert the data to a CSV string, excluding the specified columns
      const csvData = convertToCSV(dataWithActionName, ["errors", "action_id", "vendor_id", "account"]);

      // Create a download link for the CSV file
      const downloadLink = document.createElement("a");
      downloadLink.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csvData));
      downloadLink.setAttribute("download",`${action_name}.csv`);

      // Append the download link to the document and click it
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    })
    .catch((error) => console.error(error));

  function convertToCSV(data, excludeColumns = []) {
    // Assuming the data is an array of objects
    const headers = Object.keys(data[0]).filter((key) => !excludeColumns.includes(key));
    const rows = data.map((item) => headers.map((header) => item[header]));

    // Join the headers and rows into a CSV string
    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  }
}
