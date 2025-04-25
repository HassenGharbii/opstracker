import * as XLSX from 'xlsx';

export const fetchAndProcessExcelData = async () => {
  try {
    // Fetch the Excel file from the public directory
    const response = await fetch('src/utils/LogAlarms.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    
    // Process the Excel data
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });

    // Get the first worksheet
    const worksheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Function to convert Excel serial date to JavaScript Date object
    const excelDateToJSDate = (serial) => {
      if (typeof serial === 'number') {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        return new Date(excelEpoch.getTime() + serial * 86400 * 1000);
      }
      return new Date(serial); // If it's a normal date string
    };

    // Process and enhance the data with time details
    const formattedData = jsonData.map(alarm => {
      if (alarm.creationDate) {
        const parsedDate = excelDateToJSDate(alarm.creationDate);
        if (!isNaN(parsedDate.getTime())) {
          alarm.creationDate = parsedDate;
          alarm.year = parsedDate.getFullYear();
          alarm.month = parsedDate.getMonth() + 1; // Months are 0-indexed
          alarm.day = parsedDate.getDate();
          alarm.hour = parsedDate.getHours();
          alarm.minutes = parsedDate.getMinutes();
          alarm.seconds = parsedDate.getSeconds();
          alarm.time = `${String(alarm.hour).padStart(2, '0')}:${String(alarm.minutes).padStart(2, '0')}:${String(alarm.seconds).padStart(2, '0')}`;
        }
      }
      return alarm;
    });

    // Group alarms by year and month
    const alarmsByYearMonth = formattedData.reduce((acc, alarm) => {
      const key = `${alarm.year}-${String(alarm.month).padStart(2, '0')}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(alarm);
      return acc;
    }, {});

    // Process the data
    return {
      alarms: formattedData,
      totalAlarms: formattedData.length,
      openAlarms: formattedData.filter(alarm => alarm.status === 'Opened').length,
      categories: [...new Set(formattedData.map(alarm => alarm.category))],
      severities: [...new Set(formattedData.map(alarm => alarm.severity))],
      alarmsByYearMonth, // Alarms grouped by year-month
    };
  } catch (error) {
    console.error('Error processing Excel file:', error);
    throw error;
  }
};
