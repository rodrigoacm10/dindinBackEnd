
// Recebe uma data e transforma em ANO - MES - DIA - HORA - MIN - SEG
// Formato: YYYY/MM/DD HH:MM:SS
export const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
    const hours = (`0${date.getHours()}`).slice(-2);
    const minutes = (`0${date.getMinutes()}`).slice(-2);
    const seconds = (`0${date.getSeconds()}`).slice(-2);
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

// Retorna o primeiro dia do mes atual formatada
export const getFirstDayOfMonth = (): any => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return formatDate(firstDayOfMonth);
  };


// Retorna a data atual formatada
export const getTodayDate = () : any => {
    const today = new Date();
    return formatDate(today);
  }