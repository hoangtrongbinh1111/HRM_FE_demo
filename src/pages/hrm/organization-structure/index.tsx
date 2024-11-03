import OrgChart from 'react-orgchart';
import 'react-orgchart/index.css';
import MyNodeComponent from './NodeComponent';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { listAllDepartmentTree } from '@/services/apis/department.api';
import { setPageTitle } from '@/store/themeConfigSlice';
import { useDispatch } from 'react-redux';
const OrganizationChart: React.FC<{}> = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle(`${t('organization_structure')}`));
    });
    const initechOrg = {
        name: `${t('Council members')}`,
        avatar: "/assets/images/default_no_image.png",
        className: 'level-0',
        level: 0,
        children: [
            {
                name: `${t('Manager')}`,
                avatar: "/assets/images/default_no_image.png",
                className: 'level-1',
                level: 1,
                children: [
                    {
                        name: `${t('Permanent director of the company')}`,
                        description: "",
                        avatar: "/assets/images/default_no_image.png",
                        className: 'level-2',
                        level: 2,
                        children: [
                            {
                                name: `${t('Finance and Accounting Department')}`,
                                description: "",
                                avatar: "/assets/images/default_no_image.png",
                                className: 'level-3',
                                level: 3
                            },
                            {
                                name: `${t('Administration and Organization Department')}`,
                                description: "",
                                avatar: "/assets/images/default_no_image.png",
                                className: 'level-3',
                                level: 3

                            },
                            {
                                name: `${t('Processing Supervision Board')}`,
                                description: "",
                                avatar: "/assets/images/default_no_image.png",
                                className: 'level-3',
                                level: 3

                            },
                            {
                                name: `${t('Camera Unit')}`,
                                description: "",
                                avatar: "/assets/images/default_no_image.png",
                                className: 'level-3',
                                level: 3

                            },
                            {
                                name: `${t('Production Supervision Board')}`,
                                description: "",
                                avatar: "/assets/images/default_no_image.png",
                                className: 'level-3',
                                level: 3

                            }
                        ]
                    },
                    {
                        name: `${t('Deputy Director of the Company in Charge of Production')}`,
                        description: "",
                        avatar: "/assets/images/default_no_image.png",
                        className: 'level-2',
                        level: 2,
                        children: [
                            {
                                name: `${t('Materials Planning Department')}`,
                                description: "",
                                avatar: "/assets/images/default_no_image.png",
                                className: 'level-3',
                                level: 3
                            },
                            {
                                name: `${t('Technical Department')}`,
                                description: "",
                                avatar: "/assets/images/default_no_image.png",
                                className: 'level-3',
                                level: 3
                            }
                        ]
                    },
                    {
                        name: `${t('Permanent Deputy Director of the Company')}`,
                        description: "",
                        avatar: "/assets/images/default_no_image.png",
                        className: 'level-2',
                        level: 2,
                        children: [
                            {
                                name: `${t('Exploitation Board of Directors')}`,
                                description: "",
                                avatar: "/assets/images/default_no_image.png",
                                className: 'level-3',
                                level: 3,
                                children: [
                                    {
                                        name: `${t('Exploitation Units')}`,
                                        description: "",
                                        avatar: "/assets/images/default_no_image.png",
                                        className: 'level-4',
                                        level: 4,
                                    },
                                    {
                                        name: `${t('Lao and Vietnamese Vehicle Teams')}`,
                                        description: "",
                                        avatar: "/assets/images/default_no_image.png",
                                        className: 'level-4',
                                        level: 4,
                                    },
                                    {
                                        name: `${t('Machinery and Drilling Teams')}`,
                                        description: "",
                                        avatar: "/assets/images/default_no_image.png",
                                        className: 'level-4',
                                        level: 4,
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: `${t('Deputy Director of the Company in Charge of the Plant')}`,
                        description: "",
                        avatar: "/assets/images/default_no_image.png",
                        className: 'level-2',
                        level: 2,
                        children: [
                            {
                                name: `${t('Plant Board of Directors')}`,
                                description: "",
                                avatar: "/assets/images/default_no_image.png",
                                className: 'level-3',
                                level: 3,
                                children: [
                                    {
                                        name: `${t('Analysis Unit')}`,
                                        description: "",
                                        avatar: "/assets/images/default_no_image.png",
                                        className: 'level-4',
                                        level: 4
                                    },
                                    {
                                        name: `${t('Technology Unit')}`,
                                        description: "",
                                        avatar: "/assets/images/default_no_image.png",
                                        className: 'level-4',
                                        level: 4
                                    },
                                    {
                                        name: `${t('Mechanical and Electrical Unit')}`,
                                        description: "",
                                        avatar: "/assets/images/default_no_image.png",
                                        className: 'level-4',
                                        level: 4
                                    },
                                    {
                                        name: `${t('2000 Plant')}`,
                                        description: "",
                                        avatar: "/assets/images/default_no_image.png",
                                        className: 'level-4',
                                        level: 4
                                    },
                                    {
                                        name: `${t('Dry Grinding Plant')}`,
                                        description: "",
                                        avatar: "/assets/images/default_no_image.png",
                                        className: 'level-4',
                                        level: 4
                                    },
                                    {
                                        name: `${t('500 Plant')}`,
                                        description: "",
                                        avatar: "/assets/images/default_no_image.png",
                                        className: 'level-4',
                                        level: 4
                                    },
                                    {
                                        name: `${t('Electrolysis Plant')}`,
                                        description: "",
                                        avatar: "/assets/images/default_no_image.png",
                                        className: 'level-4',
                                        level: 4
                                    }
                                ]
                            },
                            {
                                name: `${t('Product Security Unit')}`,
                                description: "",
                                avatar: "/assets/images/default_no_image.png",
                                className: 'level-3',
                                level: 3
                            },
                            {
                                name: `${t('Mechanical and Electrical Technical Department')}`,
                                description: "",
                                avatar: "/assets/images/default_no_image.png",
                                className: 'level-3',
                                level: 3
                            }
                        ]
                    }
                ],
            }
        ]
    };
    const [data, setData] = useState(initechOrg);
    // useEffect(() => {
    //     listAllDepartmentTree({
    //         page: 1,
    //         perPage: 200
    //     }).then((res) => {
    //         setData(res?.data[0] ?? [])
    //     }).catch((err) => {
    //         console.log(err);
    //     })
    // }, [])

    return (
        <div>
            <h1 className='uppercase company-name'>{t('organization_structure')}</h1>
            <h1 className='uppercase company-name'>VANGTAT MINING</h1>
            <div className="panel mt-6" style={{ overflowY: 'scroll' }}>
                <OrgChart tree={data} NodeComponent={MyNodeComponent} />
            </div>
        </div>
    );
};
export default OrganizationChart;
