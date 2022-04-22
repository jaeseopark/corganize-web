import { CorganizeFile } from "typedefs/CorganizeFile"

export type UpdateFile = (partialProps: Partial<CorganizeFile>) => Promise<void>
export type FileViewComponentProps = {
    file: CorganizeFile;
    updateFile: UpdateFile
};
