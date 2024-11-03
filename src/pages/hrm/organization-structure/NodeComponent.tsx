
import { useTranslation } from 'react-i18next';

interface MyNode {
    actor: string;
    name: string;
    className: string;
    description: string;
    siblings: any;
    avatar: string;
    level: number;
}

const MyNodeComponent: React.FC<{ node: MyNode }> = ({ node }) => {
    const { t } = useTranslation();
    return (
        <>
            <div className={`initechNode level-${node?.level} inline-flex`}>
                <img className='avatar col' src={node?.avatar ?? "/assets/images/defalt_no_image.png"} />
                <div className="" style={{ display: "flex", alignItems: "center" }}>
                    <p className="deparment-description">{node?.name || "Unknown"}</p>
                    <p className="deparment-description">{node?.description || ""}</p>
                </div>
            </div>
            {
                node?.siblings?.length > 0 &&
                <div className={`initechNode ${node?.className} inline-flex`} style={{ margin: 'auto' }}>
                    <img className='avatar col' src={node?.siblings[0].avatar} />
                    <div>
                            <p className="deparment-description">{node?.siblings[0]?.name || "Unknown"}</p>
                            <p className="deparment-description">{node?.siblings[0]?.description || ""}</p>
                    </div>
                </div>
            }
        </>

    );
};

export default MyNodeComponent;
