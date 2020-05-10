
// TEST: recurring background event? (It works!)
// let counter = 10;
// let interval = setInterval(() => {
//     console.log(counter);
//     counter--;
//     if (counter <= 0) {
//         clearInterval(interval);
//     }
// }, 1000);

export const settings = {
    getServerUrl: () => {
        return localStorage.getItem('serverUrl');
    },
    setServerUrl: (url: string) => {
        localStorage.setItem('serverUrl', url);
    },

    getUserName: () => {
        return localStorage.getItem('userName');
    },
    setUserName: (userName: string) => {
        localStorage.setItem('userName', userName);
    },
};
