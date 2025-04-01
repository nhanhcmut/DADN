export const setTokenInCookie = (token: string) => {
    document.cookie = `token=${token}; path=/; secure; samesite=strict; max-age=${60 * 60 * 24 * 7}`;
};

export const getTokenFromCookie = (): string | null => {
    const name = 'token=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim();
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return null;
};

export const removeTokenFromCookie = () => {
    document.cookie = `token=; path=/; max-age=0; secure; samesite=strict`;
};