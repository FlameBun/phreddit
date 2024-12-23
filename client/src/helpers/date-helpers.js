// Date Helper Functions

/**
 * Generate timestamp from postedDate to the current date.
 */
const msSecond = 1000;
const msMinute = 60000;
const msHour = 3600000;
const msDay = 86400000;
const msMonth = 2592000000; // A month is considered 30 days
const msYear = 31556952000;
export function generateTimestamp(postedDate) {
  // Convert postedDate and currentDate to UTC
  postedDate = Date.UTC(
    postedDate.getFullYear(),
    postedDate.getMonth(),
    postedDate.getDate(),
    postedDate.getHours(),
    postedDate.getMinutes(),
    postedDate.getSeconds(),
    postedDate.getMilliseconds()
  );
  let currentDate = new Date();
  currentDate = Date.UTC(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    currentDate.getHours(),
    currentDate.getMinutes(),
    currentDate.getSeconds(),
    currentDate.getMilliseconds()
  );

  // Determine timestamp based on time difference
  let timeStamp;
  const timeDiff = currentDate - postedDate;
  if (timeDiff < msMinute)
    timeStamp = `${Math.floor(timeDiff / msSecond)} seconds ago`;
  else if (timeDiff < msHour)
    timeStamp = `${Math.floor(timeDiff / msMinute)} minutes ago`;
  else if (timeDiff < msDay)
    timeStamp = `${Math.floor(timeDiff / msHour)} hours ago`;
  else if (timeDiff < msMonth)
    timeStamp = `${Math.floor(timeDiff / msDay)} days ago`;
  else if (timeDiff < msYear)
    timeStamp = `${Math.floor(timeDiff / msMonth)} months ago`;
  else timeStamp = `${Math.floor(timeDiff / msYear)} years ago`;

  return timeStamp;
}
