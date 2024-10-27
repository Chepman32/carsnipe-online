/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextFieldProps } from "@aws-amplify/ui-react";
export declare type EscapeHatchProps = {
    [elementHierarchy: string]: Record<string, unknown>;
} | null;
export declare type VariantValues = {
    [key: string]: string;
};
export declare type Variant = {
    variantValues: VariantValues;
    overrides: EscapeHatchProps;
};
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type AuctionUpdateFormInputValues = {
    make?: string;
    model?: string;
    year?: number;
    carId?: string;
    currentBid?: number;
    endTime?: string;
    status?: string;
    lastBidPlayer?: string;
    player?: string;
    buy?: number;
    minBid?: number;
    type?: string;
};
export declare type AuctionUpdateFormValidationValues = {
    make?: ValidationFunction<string>;
    model?: ValidationFunction<string>;
    year?: ValidationFunction<number>;
    carId?: ValidationFunction<string>;
    currentBid?: ValidationFunction<number>;
    endTime?: ValidationFunction<string>;
    status?: ValidationFunction<string>;
    lastBidPlayer?: ValidationFunction<string>;
    player?: ValidationFunction<string>;
    buy?: ValidationFunction<number>;
    minBid?: ValidationFunction<number>;
    type?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type AuctionUpdateFormOverridesProps = {
    AuctionUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    make?: PrimitiveOverrideProps<TextFieldProps>;
    model?: PrimitiveOverrideProps<TextFieldProps>;
    year?: PrimitiveOverrideProps<TextFieldProps>;
    carId?: PrimitiveOverrideProps<TextFieldProps>;
    currentBid?: PrimitiveOverrideProps<TextFieldProps>;
    endTime?: PrimitiveOverrideProps<TextFieldProps>;
    status?: PrimitiveOverrideProps<TextFieldProps>;
    lastBidPlayer?: PrimitiveOverrideProps<TextFieldProps>;
    player?: PrimitiveOverrideProps<TextFieldProps>;
    buy?: PrimitiveOverrideProps<TextFieldProps>;
    minBid?: PrimitiveOverrideProps<TextFieldProps>;
    type?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type AuctionUpdateFormProps = React.PropsWithChildren<{
    overrides?: AuctionUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    auction?: any;
    onSubmit?: (fields: AuctionUpdateFormInputValues) => AuctionUpdateFormInputValues;
    onSuccess?: (fields: AuctionUpdateFormInputValues) => void;
    onError?: (fields: AuctionUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: AuctionUpdateFormInputValues) => AuctionUpdateFormInputValues;
    onValidate?: AuctionUpdateFormValidationValues;
} & React.CSSProperties>;
export default function AuctionUpdateForm(props: AuctionUpdateFormProps): React.ReactElement;
