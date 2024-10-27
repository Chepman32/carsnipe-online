/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import { Button, Flex, Grid, TextField } from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { generateClient } from "aws-amplify/api";
import { getAuction } from "../graphql/queries";
import { updateAuction } from "../graphql/mutations";
const client = generateClient();
export default function AuctionUpdateForm(props) {
  const {
    id: idProp,
    auction: auctionModelProp,
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
    carId: "",
    currentBid: "",
    endTime: "",
    status: "",
    lastBidPlayer: "",
    player: "",
    buy: "",
    minBid: "",
    type: "",
  };
  const [make, setMake] = React.useState(initialValues.make);
  const [model, setModel] = React.useState(initialValues.model);
  const [year, setYear] = React.useState(initialValues.year);
  const [carId, setCarId] = React.useState(initialValues.carId);
  const [currentBid, setCurrentBid] = React.useState(initialValues.currentBid);
  const [endTime, setEndTime] = React.useState(initialValues.endTime);
  const [status, setStatus] = React.useState(initialValues.status);
  const [lastBidPlayer, setLastBidPlayer] = React.useState(
    initialValues.lastBidPlayer
  );
  const [player, setPlayer] = React.useState(initialValues.player);
  const [buy, setBuy] = React.useState(initialValues.buy);
  const [minBid, setMinBid] = React.useState(initialValues.minBid);
  const [type, setType] = React.useState(initialValues.type);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    const cleanValues = auctionRecord
      ? { ...initialValues, ...auctionRecord }
      : initialValues;
    setMake(cleanValues.make);
    setModel(cleanValues.model);
    setYear(cleanValues.year);
    setCarId(cleanValues.carId);
    setCurrentBid(cleanValues.currentBid);
    setEndTime(cleanValues.endTime);
    setStatus(cleanValues.status);
    setLastBidPlayer(cleanValues.lastBidPlayer);
    setPlayer(cleanValues.player);
    setBuy(cleanValues.buy);
    setMinBid(cleanValues.minBid);
    setType(cleanValues.type);
    setErrors({});
  };
  const [auctionRecord, setAuctionRecord] = React.useState(auctionModelProp);
  React.useEffect(() => {
    const queryData = async () => {
      const record = idProp
        ? (
            await client.graphql({
              query: getAuction.replaceAll("__typename", ""),
              variables: { id: idProp },
            })
          )?.data?.getAuction
        : auctionModelProp;
      setAuctionRecord(record);
    };
    queryData();
  }, [idProp, auctionModelProp]);
  React.useEffect(resetStateValues, [auctionRecord]);
  const validations = {
    make: [{ type: "Required" }],
    model: [{ type: "Required" }],
    year: [],
    carId: [],
    currentBid: [],
    endTime: [{ type: "Required" }],
    status: [{ type: "Required" }],
    lastBidPlayer: [],
    player: [{ type: "Required" }],
    buy: [{ type: "Required" }],
    minBid: [{ type: "Required" }],
    type: [{ type: "Required" }],
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
          year: year ?? null,
          carId: carId ?? null,
          currentBid: currentBid ?? null,
          endTime,
          status,
          lastBidPlayer: lastBidPlayer ?? null,
          player,
          buy,
          minBid,
          type,
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
            query: updateAuction.replaceAll("__typename", ""),
            variables: {
              input: {
                id: auctionRecord.id,
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
      {...getOverrideProps(overrides, "AuctionUpdateForm")}
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
              carId,
              currentBid,
              endTime,
              status,
              lastBidPlayer,
              player,
              buy,
              minBid,
              type,
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
              carId,
              currentBid,
              endTime,
              status,
              lastBidPlayer,
              player,
              buy,
              minBid,
              type,
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
        isRequired={false}
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
              carId,
              currentBid,
              endTime,
              status,
              lastBidPlayer,
              player,
              buy,
              minBid,
              type,
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
        label="Car id"
        isRequired={false}
        isReadOnly={false}
        value={carId}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              make,
              model,
              year,
              carId: value,
              currentBid,
              endTime,
              status,
              lastBidPlayer,
              player,
              buy,
              minBid,
              type,
            };
            const result = onChange(modelFields);
            value = result?.carId ?? value;
          }
          if (errors.carId?.hasError) {
            runValidationTasks("carId", value);
          }
          setCarId(value);
        }}
        onBlur={() => runValidationTasks("carId", carId)}
        errorMessage={errors.carId?.errorMessage}
        hasError={errors.carId?.hasError}
        {...getOverrideProps(overrides, "carId")}
      ></TextField>
      <TextField
        label="Current bid"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={currentBid}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              make,
              model,
              year,
              carId,
              currentBid: value,
              endTime,
              status,
              lastBidPlayer,
              player,
              buy,
              minBid,
              type,
            };
            const result = onChange(modelFields);
            value = result?.currentBid ?? value;
          }
          if (errors.currentBid?.hasError) {
            runValidationTasks("currentBid", value);
          }
          setCurrentBid(value);
        }}
        onBlur={() => runValidationTasks("currentBid", currentBid)}
        errorMessage={errors.currentBid?.errorMessage}
        hasError={errors.currentBid?.hasError}
        {...getOverrideProps(overrides, "currentBid")}
      ></TextField>
      <TextField
        label="End time"
        isRequired={true}
        isReadOnly={false}
        value={endTime}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              make,
              model,
              year,
              carId,
              currentBid,
              endTime: value,
              status,
              lastBidPlayer,
              player,
              buy,
              minBid,
              type,
            };
            const result = onChange(modelFields);
            value = result?.endTime ?? value;
          }
          if (errors.endTime?.hasError) {
            runValidationTasks("endTime", value);
          }
          setEndTime(value);
        }}
        onBlur={() => runValidationTasks("endTime", endTime)}
        errorMessage={errors.endTime?.errorMessage}
        hasError={errors.endTime?.hasError}
        {...getOverrideProps(overrides, "endTime")}
      ></TextField>
      <TextField
        label="Status"
        isRequired={true}
        isReadOnly={false}
        value={status}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              make,
              model,
              year,
              carId,
              currentBid,
              endTime,
              status: value,
              lastBidPlayer,
              player,
              buy,
              minBid,
              type,
            };
            const result = onChange(modelFields);
            value = result?.status ?? value;
          }
          if (errors.status?.hasError) {
            runValidationTasks("status", value);
          }
          setStatus(value);
        }}
        onBlur={() => runValidationTasks("status", status)}
        errorMessage={errors.status?.errorMessage}
        hasError={errors.status?.hasError}
        {...getOverrideProps(overrides, "status")}
      ></TextField>
      <TextField
        label="Last bid player"
        isRequired={false}
        isReadOnly={false}
        value={lastBidPlayer}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              make,
              model,
              year,
              carId,
              currentBid,
              endTime,
              status,
              lastBidPlayer: value,
              player,
              buy,
              minBid,
              type,
            };
            const result = onChange(modelFields);
            value = result?.lastBidPlayer ?? value;
          }
          if (errors.lastBidPlayer?.hasError) {
            runValidationTasks("lastBidPlayer", value);
          }
          setLastBidPlayer(value);
        }}
        onBlur={() => runValidationTasks("lastBidPlayer", lastBidPlayer)}
        errorMessage={errors.lastBidPlayer?.errorMessage}
        hasError={errors.lastBidPlayer?.hasError}
        {...getOverrideProps(overrides, "lastBidPlayer")}
      ></TextField>
      <TextField
        label="Player"
        isRequired={true}
        isReadOnly={false}
        value={player}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              make,
              model,
              year,
              carId,
              currentBid,
              endTime,
              status,
              lastBidPlayer,
              player: value,
              buy,
              minBid,
              type,
            };
            const result = onChange(modelFields);
            value = result?.player ?? value;
          }
          if (errors.player?.hasError) {
            runValidationTasks("player", value);
          }
          setPlayer(value);
        }}
        onBlur={() => runValidationTasks("player", player)}
        errorMessage={errors.player?.errorMessage}
        hasError={errors.player?.hasError}
        {...getOverrideProps(overrides, "player")}
      ></TextField>
      <TextField
        label="Buy"
        isRequired={true}
        isReadOnly={false}
        type="number"
        step="any"
        value={buy}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              make,
              model,
              year,
              carId,
              currentBid,
              endTime,
              status,
              lastBidPlayer,
              player,
              buy: value,
              minBid,
              type,
            };
            const result = onChange(modelFields);
            value = result?.buy ?? value;
          }
          if (errors.buy?.hasError) {
            runValidationTasks("buy", value);
          }
          setBuy(value);
        }}
        onBlur={() => runValidationTasks("buy", buy)}
        errorMessage={errors.buy?.errorMessage}
        hasError={errors.buy?.hasError}
        {...getOverrideProps(overrides, "buy")}
      ></TextField>
      <TextField
        label="Min bid"
        isRequired={true}
        isReadOnly={false}
        type="number"
        step="any"
        value={minBid}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              make,
              model,
              year,
              carId,
              currentBid,
              endTime,
              status,
              lastBidPlayer,
              player,
              buy,
              minBid: value,
              type,
            };
            const result = onChange(modelFields);
            value = result?.minBid ?? value;
          }
          if (errors.minBid?.hasError) {
            runValidationTasks("minBid", value);
          }
          setMinBid(value);
        }}
        onBlur={() => runValidationTasks("minBid", minBid)}
        errorMessage={errors.minBid?.errorMessage}
        hasError={errors.minBid?.hasError}
        {...getOverrideProps(overrides, "minBid")}
      ></TextField>
      <TextField
        label="Type"
        isRequired={true}
        isReadOnly={false}
        value={type}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              make,
              model,
              year,
              carId,
              currentBid,
              endTime,
              status,
              lastBidPlayer,
              player,
              buy,
              minBid,
              type: value,
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
          isDisabled={!(idProp || auctionModelProp)}
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
              !(idProp || auctionModelProp) ||
              Object.values(errors).some((e) => e?.hasError)
            }
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
