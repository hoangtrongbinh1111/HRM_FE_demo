/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { useEffect, useState } from 'react';
import { setPageTitle, toggleLocale, toggleRTL } from '../../store/themeConfigSlice';
import BlankLayout from '@/components/Layouts/BlankLayout';
import { useTranslation } from 'react-i18next';
import Dropdown from '@/components/Dropdown';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import IconMail from '@/components/Icon/IconMail';
import { Formik, Form, Field } from 'formik';
import Link from 'next/link';
import * as Yup from 'yup';
import { ChangePassword } from '@/services/apis/auth.api';
import Config from '@/@core/configs';
import Cookies from 'js-cookie';
import { showMessage } from '@/@core/utils';

const RecoverIdBox = () => {
    const { t, i18n } = useTranslation();

    const SubmittedForm = Yup.object().shape({
        old_password: Yup.string().required(`${t("please_fill")}`),
        new_password: Yup.string().required(`${t("please_fill")}`),
        confirm_password: Yup.string().required(`${t("please_fill")}`),
    });

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Recover Id Box'));
    });
    const router = useRouter();

    const submitForm = (e: any) => {
        ChangePassword(e).then(() => {
            const accessTokenKey = Config.Env.NEXT_PUBLIC_X_ACCESS_TOKEN as string;
            Cookies.remove(accessTokenKey);
            showMessage(`${t('update_success')}`, 'success');
            router.push('/');
        }).catch((err) => {
            console.error(err);
        })
    };
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const setLocale = (flag: string) => {
        setFlag(flag);
        if (flag.toLowerCase() === 'ae') {
            dispatch(toggleRTL('rtl'));
        } else {
            dispatch(toggleRTL('ltr'));
        }
    };
    const [flag, setFlag] = useState('');
    useEffect(() => {
        setLocale(localStorage.getItem('i18nextLng') || themeConfig.locale);
    }, []);

    return (
        <div>
            <div className="absolute inset-0">
                <img src="/assets/images/login_bg.png" alt="image" className="w-full h-full object-cover" />
            </div>
            <div className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-28 gap-20 ml-8 mr-8" style={{ margin: "auto" }}>
                {/* <div className='flex-1 items-center' style={{ display: "flex", flexDirection: 'column' }}> */}
                {/* <img src='/assets/images/logo_login.png' style={{ width: "70%" }} className='' /> */}
                {/* <h1 className='company-name mb-2'>vangtat mining</h1> */}
                {/* <span className='welcome uppercase'>{t('welcome')}</span>
                    <span className='welcome-member uppercase'>{t('vangtat_participants')}</span> */}
                {/* </div> */}
                <div className="relative max-w-[50%] rounded-md p-2 flex-1 form-login-container">
                    <div className="relative flex flex-col justify-center rounded-md bg-white/60 px-6 py-20 backdrop-blur-lg dark:bg-black/50 lg:min-h-[70vh]">
                        <div className="absolute end-6 top-6">
                            <div className="dropdown">
                                <Dropdown
                                    offset={[0, 8]}
                                    placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                    btnClassName="flex items-center gap-2.5 rounded-lg border border-white-dark/30 bg-white px-2 py-1.5 text-white-dark hover:border-primary hover:text-primary dark:bg-black"
                                    button={
                                        <>
                                            <div>
                                                <img src={`/assets/images/flags/${flag.toUpperCase()}.svg`} alt="image" className="h-5 w-5 rounded-full object-cover" />
                                            </div>
                                            <div className="text-base font-bold uppercase">{flag}</div>
                                            <span className="shrink-0">
                                                <IconCaretDown />
                                            </span>
                                        </>
                                    }
                                >
                                    <ul className="w-[200px] font-semibold text-dark dark:text-white-dark dark:text-white-light/90 language-list">
                                        {themeConfig.languageList.map((item: any) => {
                                            return (
                                                <li className="language-option" key={item.code}>
                                                    <button
                                                        type="button"
                                                        className={`flex w-full rounded-lg hover:text-primary ${flag === item.code ? 'bg-primary/10 text-primary' : ''}`}
                                                        onClick={() => {
                                                            dispatch(toggleLocale(item.code));
                                                            i18n.changeLanguage(item.code);
                                                            setLocale(item.code);
                                                        }}
                                                    >
                                                        <img src={`/assets/images/flags/${item.code.toUpperCase()}.svg`} alt="flag" className="h-5 w-5 rounded-full object-cover" />
                                                        <span className="ltr:ml-3 rtl:mr-3">{item.name}</span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </Dropdown>
                            </div>
                        </div>
                        <div className="mx-auto w-full max-w-[440px]">
                            <div className="mb-10">
                                <h1 className="uppercase !leading-snug sign-in-text text-center">{t('change_password')}</h1>
                            </div>
                            <Formik
                                initialValues={{
                                    old_password: '',
                                    new_password: "",
                                    confirm_password: '',
                                }}
                                validationSchema={SubmittedForm}
                                onSubmit={(value) => submitForm(value)}
                            >
                                {({ errors, submitCount, touched }) => (
                                    <Form className="space-y-5 dark:text-white">
                                        <div>
                                            <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <label htmlFor="passWord" className='label-login'>
                                                    {t('old_password')}<span style={{ color: 'red' }}> * </span>
                                                </label>

                                            </p>
                                            <div className="relative text-white-dark">
                                                <Field autoComplete="off"
                                                    name="old_password"
                                                    data-testid="password"
                                                    id="passWord"
                                                    type="password"
                                                    placeholder={t('enter_old_password')}
                                                    className="form-input placeholder:text-white-dark"
                                                />
                                                {/* <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconLockDots fill={true} />
                                        </span> */}
                                                {submitCount ? errors.old_password && <div className="mt-1 text-danger">{errors.old_password}</div> : ''}
                                            </div>
                                        </div>

                                        <div>
                                            <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <label htmlFor="passWord" className='label-login'>
                                                    {t('new_password')}<span style={{ color: 'red' }}> * </span>
                                                </label>

                                            </p>
                                            <div className="relative text-white-dark">
                                                <Field autoComplete="off"
                                                    name="new_password"
                                                    data-testid="password"
                                                    id="new_password"
                                                    type="password"
                                                    placeholder={t('enter_new_password')}
                                                    className="form-input placeholder:text-white-dark"
                                                />
                                                {/* <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconLockDots fill={true} />
                                        </span> */}
                                                {submitCount ? errors.new_password && <div className="mt-1 text-danger">{errors.new_password}</div> : ''}
                                            </div>
                                        </div>

                                        <div>
                                            <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <label htmlFor="passWord" className='label-login'>
                                                    {t('confirm_password')}<span style={{ color: 'red' }}> * </span>
                                                </label>

                                            </p>
                                            <div className="relative text-white-dark">
                                                <Field autoComplete="off"
                                                    name="confirm_password"
                                                    data-testid="password"
                                                    id="confirm_password"
                                                    type="password"
                                                    placeholder={t('enter_confirm_password')}
                                                    className="form-input placeholder:text-white-dark"
                                                />
                                                {/* <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconLockDots fill={true} />
                                        </span> */}
                                                {submitCount ? errors.confirm_password && <div className="mt-1 text-danger">{errors.confirm_password}</div> : ''}
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            data-testid="submit"
                                            className="sign-in-btn"
                                        >
                                            {t('change_password')}
                                        </button>
                                    </Form>
                                )}
                            </Formik>
                            {/* <div className="relative my-7 md:mb-9 text-center">
                                <Link href="/auth/cover-password-reset">
                                    <span className='forget-pass-text'>{t('forget_password')}
                                    </span></Link>
                            </div> */}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
RecoverIdBox.getLayout = (page: any) => {
    return <BlankLayout>{page}</BlankLayout>;
};
export default RecoverIdBox;
