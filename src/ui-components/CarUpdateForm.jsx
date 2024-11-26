/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import {
  Button,
  Flex,
  Grid,
  SwitchField,
  TextField,
} from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { generateClient } from "aws-amplify/api";
import { getCar } from "../graphql/queries";
import { updateCar } from "../graphql/mutations";
const client = generateClient();
export default function CarUpdateForm(props) {
  const {
    id: idProp,
    car: carModelProp,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    make: "",
    model: "",
    year: "",
    price: "",
    type: "",
    purchasePrice: "",
    sellPrice: "",
    inAuction: false,
  };
  const [make, setMake] = React.useState(initialValues.make);
  const [model, setModel] = React.useState(initialValues.model);
  const [year, setYear] = React.useState(initialValues.year);
  const [price, setPrice] = React.useState(initialValues.price);
  const [type, setType] = React.useState(initialValues.type);
  const [purchasePrice, setPurchasePrice] = React.useState(
    initialValues.purchasePrice
  );
  const [sellPrice, setSellPrice] = React.useState(initialValues.sellPrice);
  const [inAuction, setInAuction] = React.useState(initialValues.inAuction);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    const cleanValues = carRecord
      ? { ...initialValues, ...carRecord }
      : initialValues;
    setMake(cleanValues.make);
    setModel(cleanValues.model);
    setYear(cleanValues.year);
    setPrice(cleanValues.price);
    setType(cleanValues.type);
    setPurchasePrice(cleanValues.purchasePrice);
    setSellPrice(cleanValues.sellPrice);
    setInAuction(cleanValues.inAuction);
    setErrors({});
  };
  const [carRecord, setCarRecord] = React.useState(carModelProp);
  React.useEffect(() => {
    const queryData = async () => {
      const record = idProp
        ? (
            await client.graphql({
              query: getCar.replaceAll("__typename", ""),
              variables: { id: idProp },
            })
          )?.data?.getCar
        : carModelProp;
      setCarRecord(record);
    };
    queryData();
  }, [idProp, carModelProp]);
  React.useEffect(resetStateValues, [carRecord]);
  const validations = {
    make: [{ type: "Required" }],
    model: [{ type: "Required" }],
    year: [{ type: "Required" }],
    price: [{ type: "Required" }],
    type: [],
    purchasePrice: [],
    sellPrice: [],
    inAuction: [],
  };
  const runValidationTasks = async (
    fieldName,
    currentValue,
    getDisplayValue
  ) => {
    const value =
      currentValue && getDisplayValue
        ? getDisplayValue(currentValue)
        : currentValue;
    let validationResponse = validateField(value, validations[fieldName]);
    const customValidator = fetchByPath(onValidate, fieldName);
    if (customValidator) {
      validationResponse = await customValidator(value, validationResponse);
    }
    setErrors((errors) => ({ ...errors, [fieldName]: validationResponse }));
    return validationResponse;
  };
  return (
    <Grid
      as="form"
      rowGap="15px"
      columnGap="15px"
      padding="20px"
      onSubmit={async (event) => {
        event.preventDefault();
        let modelFields = {
          make,
          model,
          year,
          price,
          type: type ?? null,
          purchasePrice: purchasePrice ?? null,
          sellPrice: sellPrice ?? null,
          inAuction: inAuction ?? null,
        };
        const validationResponses = await Promise.all(
          Object.keys(validations).reduce((promises, fieldName) => {
            if (Array.isArray(modelFields[fieldName])) {
              promises.push(
                ...modelFields[fieldName].map((item) =>
                  runValidationTasks(fieldName, item)
                )
              );
              return promises;
            }
            promises.push(
              runValidationTasks(fieldName, modelFields[fieldName])
            );
            return promises;
          }, [])
        );
        if (validationResponses.some((r) => r.hasError)) {
          return;
        }
        if (onSubmit) {
          modelFields = onSubmit(modelFields);
        }
        try {
          Object.entries(modelFields).forEach(([key, value]) => {
            if (typeof value === "string" && value === "") {
              modelFields[key] = null;
            }
          });
          await client.graphql({
            query: updateCar.replaceAll("__typename", ""),
            variables: {
              input: {
                id: carRecord.id,
                ...modelFields,
              },
            },
          });
          if (onSuccess) {
            onSuccess(modelFields);
          }
        } catch (err) {
          if (onError) {
            const messages = err.errors.map((e) => e.message).join("\n");
            onError(modelFields, messages);
          }
        }
      }}
      {...getOverrideProps(overrides, "CarUpdateForm")}
      {...rest}
    >
      <TextField
        label="Make"
        isRequired={true}
        isReadOnly={false}
        value={make}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              make: value,
              model,
              year,
              price,
              type,
              purchasePrice,
              sellPrice,
              inAuction,
            };
            const result = onChange(modelFields);
            value = result?.make ?? value;
          }
          if (errors.make?.hasError) {
            runValidationTasks("make", value);
          }
          setMake(value);
        }}
        onBlur={() => runValidationTasks("make", make)}
        errorMessage={errors.make?.errorMessage}
        hasError={errors.make?.hasError}
        {...getOverrideProps(overrides, "make")}
      ></TextField>
      <TextField
        label="Model"
        isRequired={true}
        isReadOnly={false}
        value={model}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              make,
              model: value,
              year,
              price,
              type,
              purchasePrice,
              sellPrice,
              inAuction,
            };
            const result = onChange(modelFields);
            value = result?.model ?? value;
          }
          if (errors.model?.hasError) {
            runValidationTasks("model", value);
          }
          setModel(value);
        }}
        onBlur={() => runValidationTasks("model", model)}
        errorMessage={errors.model?.errorMessage}
        hasError={errors.model?.hasError}
        {...getOverrideProps(overrides, "model")}
      ></TextField>
      <TextField
        label="Year"
        isRequired={true}
        isReadOnly={false}
        type="number"
        step="any"
        value={year}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              make,
              model,
              year: value,
              price,
              type,
              purchasePrice,
              sellPrice,
              inAuction,
            };
            const result = onChange(modelFields);
            value = result?.year ?? value;
          }
          if (errors.year?.hasError) {
            runValidationTasks("year", value);
          }
          setYear(value);
        }}
        onBlur={() => runValidationTasks("year", year)}
        errorMessage={errors.year?.errorMessage}
        hasError={errors.year?.hasError}
        {...getOverrideProps(overrides, "year")}
      ></TextField>
      <TextField
        label="Price"
        isRequired={true}
        isReadOnly={false}
        type="number"
        step="any"
        value={price}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              make,
              model,
              year,
              price: value,
              type,
              purchasePrice,
              sellPrice,
              inAuction,
            };
            const result = onChange(modelFields);
            value = result?.price ?? value;
          }
          if (errors.price?.hasError) {
            runValidationTasks("price", value);
          }
          setPrice(value);
        }}
        onBlur={() => runValidationTasks("price", price)}
        errorMessage={errors.price?.errorMessage}
        hasError={errors.price?.hasError}
        {...getOverrideProps(overrides, "price")}
      ></TextField>
      <TextField
        label="Type"
        isRequired={false}
        isReadOnly={false}
        value={type}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              make,
              model,
              year,
              price,
              type: value,
              purchasePrice,
              sellPrice,
              inAuction,
            };
            const result = onChange(modelFields);
            value = result?.type ?? value;
          }
          if (errors.type?.hasError) {
            runValidationTasks("type", value);
          }
          setType(value);
        }}
        onBlur={() => runValidationTasks("type", type)}
        errorMessage={errors.type?.errorMessage}
        hasError={errors.type?.hasError}
        {...getOverrideProps(overrides, "type")}
      ></TextField>
      <TextField
        label="Purchase price"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={purchasePrice}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              make,
              model,
              year,
              price,
              type,
              purchasePrice: value,
              sellPrice,
              inAuction,
            };
            const result = onChange(modelFields);
            value = result?.purchasePrice ?? value;
          }
          if (errors.purchasePrice?.hasError) {
            runValidationTasks("purchasePrice", value);
          }
          setPurchasePrice(value);
        }}
        onBlur={() => runValidationTasks("purchasePrice", purchasePrice)}
        errorMessage={errors.purchasePrice?.errorMessage}
        hasError={errors.purchasePrice?.hasError}
        {...getOverrideProps(overrides, "purchasePrice")}
      ></TextField>
      <TextField
        label="Sell price"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={sellPrice}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              make,
              model,
              year,
              price,
              type,
              purchasePrice,
              sellPrice: value,
              inAuction,
            };
            const result = onChange(modelFields);
            value = result?.sellPrice ?? value;
          }
          if (errors.sellPrice?.hasError) {
            runValidationTasks("sellPrice", value);
          }
          setSellPrice(value);
        }}
        onBlur={() => runValidationTasks("sellPrice", sellPrice)}
        errorMessage={errors.sellPrice?.errorMessage}
        hasError={errors.sellPrice?.hasError}
        {...getOverrideProps(overrides, "sellPrice")}
      ></TextField>
      <SwitchField
        label="In auction"
        defaultChecked={false}
        isDisabled={false}
        isChecked={inAuction}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              make,
              model,
              year,
              price,
              type,
              purchasePrice,
              sellPrice,
              inAuction: value,
            };
            const result = onChange(modelFields);
            value = result?.inAuction ?? value;
          }
          if (errors.inAuction?.hasError) {
            runValidationTasks("inAuction", value);
          }
          setInAuction(value);
        }}
        onBlur={() => runValidationTasks("inAuction", inAuction)}
        errorMessage={errors.inAuction?.errorMessage}
        hasError={errors.inAuction?.hasError}
        {...getOverrideProps(overrides, "inAuction")}
      ></SwitchField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Reset"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          isDisabled={!(idProp || carModelProp)}
          {...getOverrideProps(overrides, "ResetButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={
              !(idProp || carModelProp) ||
              Object.values(errors).some((e) => e?.hasError)
            }
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
