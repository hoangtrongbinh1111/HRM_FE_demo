import React from 'react';

const Context = React.createContext<any>({});
export const useContext = () => React.useContext(Context);
export const ContextProvider = ({ children, value }: any) => {
	return <Context.Provider value={value}>{children}</Context.Provider>;
};
