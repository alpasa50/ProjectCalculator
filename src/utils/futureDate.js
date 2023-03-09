function calculateFutureDate(dateType, value) {
    const today = new Date();
    let futureDate = new Date(today);
    
    if (dateType === 'years') {
      futureDate.setFullYear(today.getFullYear() + value);
    } else if (dateType === 'months') {
      futureDate.setMonth(today.getMonth() + value);
    } else if (dateType === 'days') {
      futureDate.setDate(today.getDate() + value);
    } else {
      return 'Invalid date type.';
    }
    
    return futureDate;
  }