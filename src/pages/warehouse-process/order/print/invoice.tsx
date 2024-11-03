import React, { Fragment } from "react";
import {
    Image,
    Text,
    View,
    Page,
    Document,
    StyleSheet,
    Font,
} from "@react-pdf/renderer";
import moment from "moment";
import { formatNumber, moneyToNumber } from "@/utils/commons";

interface Props {
    [key: string]: any;
}

const Invoice = ({ ...props }: Props) => {
    Font.register({
        family: "Lao",
        src: "/fonts/laoFont.ttf",
    });

    Font.register({
        family: "Roboto",
        src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
    });

    const styles = StyleSheet.create({
        page: {
            fontSize: 11,
            paddingTop: 20,
            paddingLeft: 40,
            paddingRight: 40,
            lineHeight: 1.5,
            flexDirection: "column",
            fontFamily: "Roboto",
        },

        spaceBetween: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#3E3E3E",
        },

        titleContainer: { flexDirection: "row", marginTop: 24 },

        titleHeader: { flexDirection: "column", marginTop: 24, justifyContent: "center" },

        titleBottom: { flexDirection: "row", gap: 50, justifyContent: "center" },

        logo: { width: 90 },

        titleHigh: { fontSize: 14, textAlign: "center", fontWeight: 900 },

        titleShort: { fontSize: 12, textAlign: "center" },

        addressTitle: { fontSize: 12 },

        title: { flexDirection: "column", fontSize: 16, textAlign: "center", fontWeight: 900 },

        lao: { fontFamily: "Lao" },

        receiver: { flexDirection: "row", textAlign: "center", gap: 40, justifyContent: "center" },

        receiverLeft: { fontWeight: "bold", fontSize: 12, textAlign: "center" },

        receiverRight: { fontWeight: "bold", fontSize: 12, textAlign: "left" },

        Proposer: { flexDirection: "row", gap: 5, fontWeight: 400, fontSize: 12 },

        bottom: { flexDirection: "column", gap: 5, marginTop: 50 },

        textBottom: { flexDirection: "column", gap: 5, fontWeight: 400, fontSize: 12, alignItems: "center" },

        date: { fontWeight: 200, fontSize: 10, alignItems: "flex-end" },


        value: { fontSize: 14, fontWeight: "bold" },

        theader: {
            fontSize: 10,
            paddingTop: 4,
            paddingLeft: 7,
            flex: 1,
            height: 40,
            backgroundColor: "#DEDEDE",
            borderColor: "whitesmoke",
            borderRightWidth: 1,
            borderBottomWidth: 1,
            textAlign: "center"
        },

        theader2: { flex: 2, borderRightWidth: 0, borderBottomWidth: 1 },

        tbody: {
            fontSize: 9,
            paddingTop: 4,
            paddingLeft: 7,
            flex: 1,
            borderColor: "whitesmoke",
            borderRightWidth: 1,
            borderBottomWidth: 1,
            textAlign: "center"
        },

        tbody2: { flex: 2, borderRightWidth: 1 },
    });

    const Title = () => (
        <View style={styles.titleContainer}>
            <View style={styles.spaceBetween}>
                <Text style={styles.titleHigh}>
                    {"CÔNG TY TNHH MTV\nMỎ VÀNG VANGTAT"}
                </Text>
                <Text style={styles.titleHigh}>
                    {"CỘNG  HÒA DÂN CHỦ NHÂN DÂN LÀO\n"}
                    <Text style={styles.titleShort}>
                        Hòa bình – Độc lập – Dân chủ - Thống nhất –Thịnh vượng {"\n"}
                    </Text>
                    <Text style={styles.lao}>ບໍລິສັດ ບໍ່ຄໍາວັງຕັດ ຈໍາກັດຜູ້ດຽວ</Text>
                </Text>
            </View>
        </View>
    );

    const Header = () => (
        <View style={styles.titleHeader}>
            <View style={styles.title}>
                <Text style={styles.lao}>
                    ໃບ​ຄຳ​ຮ້ອງ​ຊື້​ວັດສະດຸ
                </Text>
                <Text>
                    PHIẾU YÊU CẦU MUA VẬT TƯ
                </Text>
            </View>
            <View style={styles.receiver}>
                <Text style={styles.receiverLeft}>
                    Kính Gửi <Text style={styles.lao}>(ຮຽນ)</Text>:
                </Text>
                <Text style={styles.receiverRight}>
                    -       Ban Lãnh Đạo Công Ty
                    <Text style={styles.lao}>(ຄະ​ນະ​ບໍ​ລິ​ຫານ){"\n"}</Text>
                    -       Phòng TC-HC
                    <Text style={styles.lao}>(ຫ້ອງ​ ຈັດຕັ້ງ​-ບໍລິຫານ)</Text>
                </Text>
            </View>
        </View>
    );

    const Transfer = () => (
        <View style={styles.titleHeader}>
            <View style={styles.Proposer}>
                <Text >Người đề nghị <Text style={styles.lao}>(ຜູ້​ສະ​ເໜີ)</Text>:</Text>
                <Text>{props?.data?.createdBy?.fullName || ""}</Text>
            </View>
            <View style={styles.Proposer}>
                <Text>Bộ phận <Text style={styles.lao}>(ພາກ​ສ່ວນ)</Text>:</Text>
                <Text>{props?.data?.createdBy?.department?.name || ""}</Text>
            </View>
            <View style={styles.Proposer}>
                <Text style={{ marginLeft: 5 }}>
                    Đề nghị ban lảnh đạo công ty và các phòng ban liên quan duyệt mua cho một số vật tư,
                    thiết bị phục vụ sản xuất của công ty như sau: {"\n"}
                    <Text style={styles.lao}>
                        ຮຽນ​ຄະ​ນະ​ບໍ​ລິ​ຫານ​ແລະ​ບັນ​ດາ​ຫ້ອງ​ການ​ທີ່​ກຽວ​ຂ້ອງ​​, ​ຂໍອະ​ນຸ​ມັດ​ຊື້ວັດ​ຖຸ​ອຸ​ປະ​ກອນ​ຮັບ​ໄຊ້​ໃນ​ການ​ຜະ​ລິດ​ຂອງ​ບໍ​ລິ​ສັດ​ດັ່ງ​ລຸ່ມ​ນີ້:
                    </Text>
                </Text>
            </View>
        </View>
    );

    const TableHead = () => (
        <View style={{ width: "100%", flexDirection: "row", marginTop: 10 }}>
            <View style={styles.theader}>
                <Text>
                    #{"\n"}
                    <Text style={styles.lao}>(ລ/ດ)</Text>
                </Text>
            </View>
            <View style={styles.theader}>
                <Text>
                    Tên vật tư{"\n"}
                    <Text style={styles.lao}>(ຊື່​ວັດ​ຖຸ​ອຸ​ປະ​ກອນ)</Text>
                </Text>
            </View>
            <View style={styles.theader}>
                <Text>
                    Số lượng{"\n"}
                    <Text style={styles.lao}>(​ຈຳ​ນວນ) </Text>
                </Text>
            </View>
            <View style={styles.theader}>
                <Text>
                    Đơn giá{"\n"}
                    <Text style={styles.lao}>(ລາຄາ)</Text>
                </Text>
            </View>
            <View style={styles.theader}>
                <Text>
                    Thành tiền{"\n"}
                    <Text style={styles.lao}>(ມູນຄ່າ)</Text>
                </Text>
            </View>
            <View style={styles.theader}>
                <Text>
                    Ghi chú{"\n"}
                    <Text style={styles.lao}>(ໝາຍ​ເຫດ)</Text>
                </Text>
            </View>
        </View>
    );

    const TableBody = () => {
        return <div>
            {
                props?.product?.map((receipt: any, index: number) => (
                    <Fragment key={receipt.id}>
                        <View style={{ width: "100%", flexDirection: "row" }}>
                            <View style={styles.tbody}>
                                <Text>{index + 1}</Text>
                            </View>
                            <View style={styles.tbody}>
                                <Text>{receipt.product.name}</Text>
                            </View>
                            <View style={styles.tbody}>
                                <Text>{receipt.quantity} </Text>
                            </View>
                            <View style={styles.tbody}>
                                <Text>{formatNumber(moneyToNumber(String(receipt.price)))}</Text>
                            </View>
                            <View style={styles.tbody}>
                                <Text>{formatNumber(moneyToNumber(String(receipt.total)))}</Text>
                            </View>
                            <View style={styles.tbody}>
                                <Text>{receipt.note}</Text>
                            </View>
                        </View>
                    </Fragment>
                ))
            }
        </div>
    }

    const Approve = () => {
        const lead = props?.data?.approvalHistory.filter((item: any) => item.approver.department.id === props?.data?.createdBy.department.id).find((item: any) => item.approver.fullName !== props?.data?.createdBy.fullName)?.approver.fullName;
        return (
            <View style={styles.bottom}>
                <View style={styles.date}>
                    <Text>Văng Tắt, ngày........tháng........Năm {moment().format("YYYY")}</Text>
                </View>
                <View style={styles.titleBottom}>
                    <View style={styles.textBottom}>
                        <Text style={styles.lao}>ຜູ້​ອຳ​ນວຍ​ການ</Text>
                        <Text>Giám Đốc Công Ty</Text>
                        <Text style={styles.value}>{props?.data?.approvalHistory.find((item: any) => item.approver.department.name === "Ban giám đốc")?.approver.fullName}</Text>
                    </View>
                    <View style={styles.textBottom}>
                        <Text style={styles.lao}>ຫ້ອງ​ຈັດຕັ້ງ-ບໍລິຫານ</Text>
                        <Text>Phòng TC-HC</Text>
                        <Text style={styles.value}>{props?.data?.approvalHistory.find((item: any) => item.approver.department.name === "Phòng tổ chức hành chính")?.approver.fullName}</Text>
                    </View>
                    <View style={styles.textBottom}>
                        <Text style={styles.lao}>ພາກ​ສ່ວນ​ຮັບ​ຜິດ​ຊອບ</Text>
                        <Text>Phụ trách bộ phận</Text>
                        <Text style={styles.value}>{lead}</Text>
                    </View>
                    <View style={styles.textBottom}>
                        <Text style={styles.lao}>ຜູ້​ສະ​ເໜີ</Text>
                        <Text>Người đề nghị</Text>
                        <Text style={styles.value}>{props?.data?.createdBy?.fullName || ""}</Text>
                    </View>
                </View>
            </View>
        )
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Title />
                <Header />
                <Transfer />
                <TableHead />
                <TableBody />
                <Approve />
            </Page>
        </Document>
    );
};

export default Invoice;
