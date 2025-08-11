import React, { createContext, FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { getUserDataWithUsername, IUserProps } from '../common/data/userDummyData';

export interface IAuthContextProps {
	user: string;
	setUser?(...args: unknown[]): unknown;
	userData: Partial<IUserProps>;
}
const AuthContext = createContext<IAuthContextProps>({} as IAuthContextProps);

interface IAuthContextProviderProps {
	children: ReactNode;
}
export const AuthContextProvider: FC<IAuthContextProviderProps> = ({ children }) => {
	const [user, setUser] = useState<string>(() => localStorage.getItem('facit_authUsername') || '');
	const [userData, setUserData] = useState<Partial<IUserProps>>({});

	// Always sync user to localStorage
	useEffect(() => {
		if (user) {
			localStorage.setItem('facit_authUsername', user);
		} else {
			localStorage.removeItem('facit_authUsername');
		}
	}, [user]);

	// Restore user from localStorage on mount and on storage events
	useEffect(() => {
		const syncUser = () => {
			const storedUser = localStorage.getItem('facit_authUsername') || '';
			setUser(storedUser);
		};
		window.addEventListener('storage', syncUser);
		return () => {
			window.removeEventListener('storage', syncUser);
		};
	}, []);

	useEffect(() => {
		if (user !== '') {
			setUserData(getUserDataWithUsername(user));
		} else {
			setUserData({});
		}
	}, [user]);

	const value = useMemo(
		() => ({
			user,
			setUser,
			userData,
		}),
		[user, userData],
	);
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
