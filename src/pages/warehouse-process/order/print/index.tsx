import React from "react";
import Invoice from "./invoice";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";

const PDFDownloadLink = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
    {
        ssr: false,
        loading: () => <p>Loading...</p>,
    },
);


interface Props {
    [key: string]: any;
}

const PdfCard = ({ ...props }: Props) => {
    const { t } = useTranslation();
    const styles = {
        container: {
            width: "220px",
            borderRadius: "5px",
            padding: "15px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            boxShadow: "0 3px 10px rgb(0 0 0 / 0.2)",
        },
        flex: { width: "100%", display: "flex", gap: "5px", alignItems: "center" },
        bold: { fontSize: "13px", fontWeight: 600 },
        thin: { fontSize: "11px", color: "#6f6f6f", fontWeight: 500 },
        btn: {
            borderRadius: "3px",
            border: "1px solid gray",
            display: "flex",
            alignItems: "center",
            gap: "2px",
            padding: "3px",
            fontSize: "11px",
            color: "#4f4f4f",
            fontWeight: 600,
            cursor: "pointer",
            userSelect: "none",
        },
    };

    return (
        <div >
            <div style={styles.flex}>
                <span style={styles.bold}>{props.title}</span>
            </div>
            <div style={{ ...styles.flex, ...{ justifyContent: "space-between" } }}>
                <PDFDownloadLink document={<Invoice data={props.data} product={props.product} />}>
                    {({ url, blob }: any) => (
                        <a href={url} target="_blank" rel="noreferrer">
                            <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button">
                                {t('export_file')}
                            </button>
                        </a>
                    )}
                </PDFDownloadLink>
            </div>
        </div>
    );
};

export default PdfCard;
