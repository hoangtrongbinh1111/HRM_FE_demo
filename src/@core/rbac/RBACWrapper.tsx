import { useProfile } from '@/services/swr/profile.swr';
import { removeVietnameseTones } from '@/utils/commons';
import { useCallback, useEffect, useState } from 'react';

interface Props {
    permissionKey: string[];
    type: 'AND' | 'OR';
    children: React.ReactNode;
}

export const allowAccess = (permissionKey: string[], type: 'AND' | 'OR', permissions: string[]) => {
    if (type === 'AND') {
        return permissionKey.every((key) => permissions?.includes(key));
    }
    if (type === 'OR') {
        return permissionKey.some((key) => permissions?.includes(key));
    }
};

const RBACWrapper = ({ permissionKey, type, children }: Props) => {
    const { data: permission } = useProfile();
    const [permissions, setPerMission] = useState([]);
    useEffect(() => {
        if (
            permission?.data?.position.level >= 4 &&
            typeof window !== 'undefined'
        ) {
            localStorage.setItem("admin", '1')
        } else {
            localStorage.setItem("admin", '0')
        }

        localStorage.setItem("idUser", permission?.data?.id)
        localStorage.setItem("isHighestPosition", permission?.data?.position.isHighestPosition)

        if (permission?.data) {
            setPerMission(permission?.data.permissions);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [permission?.data]);
    const internalAllowAccess = useCallback(() => allowAccess(permissionKey, type, permissions), [permissionKey, type, permissions]);

    if (permission?.data?.accountId === 1) {
        return <>{children}</>;
    }

    return <>{internalAllowAccess() && children}</>;
};
export default RBACWrapper;
