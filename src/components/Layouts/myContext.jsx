import React, { createContext, useState, useContext } from 'react';

// Tạo context
const MyContext = createContext();

export const MyProvider = ({ children }) => {
    const [myValue, setMyValue] = useState(false);

    return (
        <MyContext.Provider value={{ myValue, setMyValue }}>
            {children}
        </MyContext.Provider>
    );
};

export const useMyContext = () => {
    const context = useContext(MyContext);
    if (context === undefined) {
        throw new Error('useMyContext must be used within a MyProvider');
    }
    return context;
};
