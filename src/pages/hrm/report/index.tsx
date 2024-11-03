import { use, useEffect, useState } from 'react';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
import 'flatpickr/dist/flatpickr.css';
import NewPersonPage from './newPerson';
import OnLeavePage from './onLeave';
import LeaveWorkPage from './leaveWork';
import { useRouter } from 'next/router';
import RBACWrapper from '@/@core/rbac/RBACWrapper';

interface Props {
    [key: string]: any;
}

const ReportPage = ({ ...props }: Props) => {

    const { t } = useTranslation();
    const router = useRouter();
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [tabsData, setTabsData] = useState([
        'new_employee_statistics',
        'leave_statistics',
        'unemployment_statistics'
    ]);


    return (
        <div>
            <div className="flex space-x-3 border-b gap-5">
                {/* Loop through tab data and render button for each. */}
                {tabsData.map((tab, idx) => {
                    return (
                        <button
                            key={idx}
                            className={`py-2 border-b-4 transition-colors duration-300 ${idx === activeTabIndex
                                ? 'border-teal-500'
                                : 'border-transparent hover:border-gray-200'
                                }`}
                            // Change the active tab on click.
                            onClick={() => { setActiveTabIndex(idx), router.replace({ query: {} }) }}
                        >
                            {t(tabsData[idx])}
                        </button>
                    );
                })}
            </div>
            {/* Show active tab content. */}
            {
                activeTabIndex === 0 ?
                    <RBACWrapper permissionKey={['report:new-person']} type={'AND'}>
                        <NewPersonPage />
                    </RBACWrapper>
                    : activeTabIndex === 1 ?
                        <RBACWrapper permissionKey={['report:on-leave']} type={'AND'}>
                            <OnLeavePage />
                        </RBACWrapper>
                        :
                        <RBACWrapper permissionKey={['report:leave-work']} type={'AND'}>
                            <LeaveWorkPage />
                        </RBACWrapper>
            }
        </div >
    );
};

export default ReportPage;
