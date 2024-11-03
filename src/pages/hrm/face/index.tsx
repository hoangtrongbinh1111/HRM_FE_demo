import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import TableTree, { Cell, Header, Headers, Row, Rows } from '@atlaskit/table-tree';
import Item from '@atlaskit/table-tree/dist/types/components/internal/item';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Face } from '@/services/swr/face.swr';
import { IconLoading } from '@/components/Icon/IconLoading';
import FaceModal from './faceModal';
import IconImportFile2 from '@/components/Icon/IconImportFile2';
import IconImportFile from '@/components/Icon/IconImportFile';
import { UploadFace } from '@/services/apis/upload.api';
import { showMessage } from '@/@core/utils';
import moment from 'moment';

interface Props {
    [key: string]: any;
}

const FacePage = ({ ...props }: Props) => {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();
    const [hasMore, setHasMore] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [startAfter, setStartAfter] = useState('');
    const { data: face, loading } = Face({ sortBy: "id.DESC", perPage: 50, ...router.query, startAfter });
    const [transformedData, setTransformedData] = useState<any>([]);

    const fetchMoreData = () => {
        setStartAfter(transformedData[transformedData.length - 1].name);
    };

    useEffect(() => {
        if (loading === false) {
            if (router.query.search !== undefined && String(router.query.search).length > 0) {
                setTransformedData(face?.data);
            } else {
                if (String(startAfter).length <= 0) {
                    setTransformedData(face?.data);
                } else {
                    setTransformedData([...transformedData, ...face?.data]);
                }
            }
        }
        if (face?.data.length <= 0) {
            setHasMore(false);
        } else {
            setHasMore(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, router, startAfter])

    type Item = {
        id: number;
        name: string;
        lastModified: string;
        size: number;
    };

    const handleSearch = (param: any) => {
        setStartAfter('');
        router.replace(
            {
                pathname: router.pathname,
                query: {
                    ...router.query,
                    search: param.target.value,
                },
            }
        );
    }

    function humanFileSize(bytes: number, si = false, dp = 1) {
        const thresh = si ? 1000 : 1024;

        if (Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }

        const units = si
            ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
            : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        let u = -1;
        const r = 10 ** dp;

        do {
            bytes /= thresh;
            ++u;
        } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


        return bytes.toFixed(dp) + ' ' + units[u];
    }


    const [name, setName] = useState("");
    const handleModal = (name: any) => {
        setOpenModal(true);
        setName(name);
    }
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (e: any) => {
        const formData = new FormData();
        Object.keys(e.target.files).map((item: any) => {
            formData.append('face', e.target.files[item])
            UploadFace(formData)
                .then((res) => {
                    showMessage(`${t('import_success')}`, 'success');
                }).catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
        })
    }

    return (
        <div className="panel mt-6">
            <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                    <li>
                        <Link href="/hrm/dashboard" className="text-primary hover:underline">
                            {t('dashboard')}
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>{t('face')}</span>

                    </li>
                </ul>
            </div>
            <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                <div className="flex items-center flex-wrap">
                    <input multiple autoComplete="off" onChange={e => handleFile(e)} type="file" ref={fileInputRef} accept=".jpg" style={{ display: "none" }} />
                    <button type="button" className=" m-1 button-table button-import" onClick={() => fileInputRef.current?.click()}>
                        <IconImportFile />
                        <span className="uppercase">{t("import_file")}</span>
                    </button>
                </div>

                <input
                    autoComplete="off"
                    type="text"
                    className="form-input w-auto"
                    data-testid="search-order-input"
                    placeholder={`${t('search')}`}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch(e)
                        }
                    }}
                />
            </div>
            <div className="mb-5 whitespace-nowrap personnel-container">
                <TableTree label="Advanced usage" className="personnel-table">
                    <Headers id="personnel-table-header" style={{ backgroundColor: "#EBEAEA" }}>
                        <Header width={'33%'}>{`${t('name_file')}`}</Header>
                        <Header width={'33%'}>{`${t('lastModified')}`}</Header>
                        <Header width={'33%'}>{`${t('size')}`}</Header>
                    </Headers>
                    <InfiniteScroll
                        dataLength={transformedData?.length}
                        next={fetchMoreData}
                        hasMore={hasMore}
                        loader={
                            loading ? <div className="mt-5 flex z-[60] place-content-center">
                                <IconLoading />
                            </div> : ""
                        }
                        endMessage={
                            <p style={{ textAlign: 'center' }} className='mt-5'>
                                <b>{t('You have seen it all')}</b>
                            </p>
                        }
                    >
                        <Rows
                            items={transformedData}
                            render={({ id, name, lastModified, size }: Item) =>
                                <Row>
                                    <Cell><div style={{ cursor: "pointer" }} onClick={e => handleModal(name)}>{name}</div></Cell>
                                    <Cell>{moment(lastModified).format("DD/MM/YYYY hh:mm")}</Cell>
                                    <Cell>{humanFileSize(Number(size), false)}</Cell>
                                </Row>
                            }
                        />
                    </InfiniteScroll>
                </TableTree>
                <FaceModal
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                    name={name}
                />
            </div>
        </div>
    );
};

export default FacePage;
