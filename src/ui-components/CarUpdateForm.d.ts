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
export declare type CarUpdateFormInputValues = {
    make?: string;
    model?: string;
    year?: number;
    price?: number;
    type?: string;
};
export declare type CarUpdateFormValidationValues = {
    make?: ValidationFunction<string>;
    model?: ValidationFunction<string>;
    year?: ValidationFunction<number>;
    price?: ValidationFunction<number>;
    type?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type CarUpdateFormOverridesProps = {
    CarUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    make?: PrimitiveOverrideProps<TextFieldProps>;
    model?: PrimitiveOverrideProps<TextFieldProps>;
    year?: PrimitiveOverrideProps<TextFieldProps>;
    price?: PrimitiveOverrideProps<TextFieldProps>;
    type?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type CarUpdateFormProps = React.PropsWithChildren<{
    overrides?: CarUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    car?: any;
    onSubmit?: (fields: CarUpdateFormInputValues) => CarUpdateFormInputValues;
    onSuccess?: (fields: CarUpdateFormInputValues) => void;
    onError?: (fields: CarUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: CarUpdateFormInputValues) => CarUpdateFormInputValues;
    onValidate?: CarUpdateFormValidationValues;
} & React.CSSProperties>;
export default function CarUpdateForm(props: CarUpdateFormProps): React.ReactElement;
