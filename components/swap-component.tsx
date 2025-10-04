"use client";

import { useState, useMemo } from "react";
// Tanstack Form
import { useForm } from "@tanstack/react-form";
import type { AnyFieldApi } from "@tanstack/react-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useChainId, useSwitchChain } from "wagmi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseEther, parseUnits } from "viem";
import { Button } from "@/components/ui/button";
import { Loader2, OctagonAlert } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMediaQuery } from "@/hooks/use-media-query";
import SwapSourceComponent from "@/components/swap-source-component";
import TransactionStatusComponent from "@/components/transaction-status-component";
import { tokenList } from "@/lib/tokenList";
import { chainList } from "@/lib/chainList";

export default function SwapComponent() {
  // detect desktop device
  const isDesktop = useMediaQuery("(min-width: 768px)");
  // check for chainId
  const chainId = useChainId();
  // hook to switch chain
  const {
    switchChain,
    isPending: isSwitchChainPending,
    isError: isSwitchChainError,
  } = useSwitchChain();
  // form to handle the swap
  const form = useForm({
    // default values for the form
    defaultValues: {
      amountIn: "",
      amountOut: "",
      chain: "1:ethereum:Ethereum",
      tokenIn: `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE:ETH:18`,
      tokenOut: "",
      slippage: "0.1",
    },
    // listeners for the form
    listeners: {
      onChange: ({ formApi }) => {
        // check if amountIn, tokenIn and tokenOut are valid
        if (
          formApi.state.values.amountIn &&
          formApi.state.values.tokenIn &&
          formApi.state.values.tokenOut &&
          formApi.state.values.slippage
        ) {
          console.log("swap component", formApi.state.values);
        }
      },
      onChangeDebounceMs: 500,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
    },
  });

  const [tokenInDialogOpen, setTokenInDialogOpen] = useState(false);
  const [tokenOutDialogOpen, setTokenOutDialogOpen] = useState(false);

  // Get all tokens for the current chain
  const chainAllTokens = useMemo(
    () => tokenList.filter((token) => token.chainId === chainId),
    [chainId]
  );

  // tokenInList excludes ETH by default and the selected tokenOut
  const tokenInList = useMemo(
    () =>
      chainAllTokens.filter((token) => {
        const isNotETH =
          token.address !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
        const isNotSelectedTokenOut =
          !form.state.values.tokenOut ||
          token.address !== form.state.values.tokenOut.split(":")[0];
        return isNotETH && isNotSelectedTokenOut;
      }),
    [chainAllTokens, form.state.values.tokenOut]
  );

  // tokenOutList excludes ETH by default and the selected tokenIn
  const tokenOutList = useMemo(
    () =>
      chainAllTokens.filter((token) => {
        const isNotETH =
          token.address !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
        const isNotSelectedTokenIn =
          !form.state.values.tokenIn ||
          token.address !== form.state.values.tokenIn.split(":")[0];
        return isNotETH && isNotSelectedTokenIn;
      }),
    [chainAllTokens, form.state.values.tokenIn]
  );

  return (
    <>
      <div className="flex flex-col border-2 border-primary gap-2 pb-8">
        <div className="flex flex-row justify-between items-center bg-primary text-secondary p-1">
          <h1 className="text-lg md:text-xl font-bold">Swap</h1>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="flex flex-col gap-4 px-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="select-chain">Select chain</Label>
              {isSwitchChainError && (
                <div className="flex flex-row gap-2 items-center bg-red-500 p-2 text-secondary w-full">
                  <OctagonAlert className="w-4 h-4" />
                  <p className="text-sm font-bold">
                    Failed to switch chain. Try again.
                  </p>
                </div>
              )}
              <Select
                onValueChange={(value) => {
                  switchChain(
                    { chainId: parseInt(value.split(":")[0]) },
                    {
                      onSuccess: () => {
                        form.setFieldValue("chain", value);
                      },
                    }
                  );
                }}
                defaultValue="1:ethereum:Ethereum"
              >
                <SelectTrigger className="w-full border-primary border-1 rounded-none">
                  <div className="flex flex-row gap-2">
                    <SelectValue placeholder="Select a chain" />
                    {isSwitchChainPending && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                  </div>
                </SelectTrigger>
                <SelectContent className="border-primary border-1 rounded-none">
                  {chainList.map((chain) => (
                    <SelectItem key={chain} value={chain}>
                      {chain.split(":")[2]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Tabs defaultValue="sell" className="w-full">
              <TabsList className="border-primary border-1 rounded-none">
                <TabsTrigger className="rounded-none" value="sell">
                  Sell
                </TabsTrigger>
                <TabsTrigger className="rounded-none" value="buy">
                  Buy
                </TabsTrigger>
              </TabsList>
              <TabsContent value="sell" className="flex flex-col gap-4">
                {/* sell form*/}
                <div>
                  <form.Field
                    name="amountIn"
                    validators={{
                      onChange: ({ value }) =>
                        !value
                          ? "Please enter an amount to swap"
                          : parseUnits(value, parseInt(form.state.values.tokenIn.split(":")[2])) < 0
                          ? "Amount must be greater than 0"
                          : undefined,
                    }}
                  >
                    {(field) => (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-row gap-2 items-center justify-between">
                          <p className="text-muted-foreground">You sell</p>
                          <div className="flex flex-row gap-4">
                            <button className="hover:cursor-pointer underline underline-offset-4">
                              25%
                            </button>
                            <button className="hover:cursor-pointer underline underline-offset-4">
                              50%
                            </button>
                            <button className="hover:cursor-pointer underline underline-offset-4">
                              75%
                            </button>
                            <button className="hover:cursor-pointer underline underline-offset-4">
                              Max
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-row items-center justify-between my-4">
                          {isDesktop ? (
                            <input
                              id={field.name}
                              name={field.name}
                              value={field.state.value || ""}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              className="bg-transparent text-4xl outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none  [&::-webkit-inner-spin-button]:appearance-none"
                              type="number"
                              placeholder="0"
                              required
                            />
                          ) : (
                            <input
                              id={field.name}
                              name={field.name}
                              value={field.state.value || ""}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              className="bg-transparent text-4xl outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              type="number"
                              inputMode="decimal"
                              pattern="[0-9]*"
                              placeholder="0"
                              required
                            />
                          )}
                          <Dialog
                            open={tokenInDialogOpen}
                            onOpenChange={setTokenInDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="rounded-none hover:cursor-pointer"
                              >
                                <form.Subscribe
                                  selector={(state) => [state.values.tokenIn]}
                                >
                                  {(
                                    tokenIn // eslint-disable-line @typescript-eslint/no-unused-vars
                                  ) => (
                                    <span>
                                      {form.state.values.tokenIn.split(":")[1]}
                                    </span>
                                  )}
                                </form.Subscribe>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] rounded-none border-primary">
                              <DialogHeader>
                                <DialogTitle>Select a token</DialogTitle>
                                <DialogDescription>
                                  Search and select a token to sell
                                </DialogDescription>
                              </DialogHeader>
                              {tokenInList.map((token) => (
                                <form.Field
                                  key={`${token.chain}:${token.address}`}
                                  name="tokenIn"
                                >
                                  {(field) => (
                                    <>
                                      <button
                                        key={`${token.chain}:${token.address}`}
                                        className="flex flex-col gap-2 hover:cursor-pointer hover:bg-primary hover:text-secondary w-full text-left p-2"
                                        onClick={() => {
                                          field.handleChange(
                                            `${token.address}:${token.symbol}:${token.decimals}`
                                          );
                                          // Clear tokenOut if it's the same as the selected tokenIn
                                          if (
                                            form.state.values.tokenOut &&
                                            form.state.values.tokenOut.split(
                                              ":"
                                            )[0] === token.address
                                          ) {
                                            form.setFieldValue("tokenOut", "");
                                          }
                                          setTokenInDialogOpen(false);
                                        }}
                                      >
                                        <p>{token.name}</p>
                                        <div className="flex flex-row gap-2 items-center">
                                          <p>{token.symbol}</p>
                                          <p className="text-muted-foreground">
                                            {token.address.slice(0, 6)}...
                                            {token.address.slice(-4)}
                                          </p>
                                        </div>
                                      </button>
                                    </>
                                  )}
                                </form.Field>
                              ))}
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button
                                    className="rounded-none hover:cursor-pointer"
                                    variant="outline"
                                  >
                                    Cancel
                                  </Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <FieldInfo field={field} />
                      </div>
                    )}
                  </form.Field>
                </div>
                <div>
                  <form.Field
                    name="tokenOut"
                    validators={{
                      onChange: ({ value }) =>
                        !value
                          ? "Please select a token to receive"
                          : value === form.state.values.tokenIn
                          ? "Cannot sell and receive the same token"
                          : undefined,
                    }}
                  >
                    {(field) => (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-row gap-2 items-center justify-between">
                          <p className="text-muted-foreground">You receive</p>
                        </div>
                        <div className="flex flex-row items-center justify-between my-4">
                          <form.Subscribe
                            selector={(state) => [state.values.amountOut]}
                          >
                            {(
                              amountOut // eslint-disable-line @typescript-eslint/no-unused-vars
                            ) => (
                              <>
                              {isDesktop ? (
                                <input
                                  id="sellFormAmountOut"
                                  name="sellFormAmountOut"
                                  value={form.state.values.amountOut}
                                  className="bg-transparent text-4xl outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  type="number"
                                  placeholder="0"
                                  readOnly
                                />
                              ) : (
                                <input
                                  id="sellFormAmountOut"
                                  name="sellFormAmountOut"
                                  value={form.state.values.amountOut}
                                  className="bg-transparent text-4xl outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  type="number"
                                  inputMode="decimal"
                                  pattern="[0-9]*"
                                  placeholder="0"
                                  readOnly
                                />
                              )}
                              </>
                            )}
                          </form.Subscribe>
                          <Dialog
                            open={tokenOutDialogOpen}
                            onOpenChange={setTokenOutDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="rounded-none hover:cursor-pointer"
                              >
                                <form.Subscribe
                                  selector={(state) => [state.values.tokenOut]}
                                >
                                  {(
                                    tokenOut // eslint-disable-line @typescript-eslint/no-unused-vars
                                  ) => (
                                    <span>
                                      {form.state.values.tokenOut.split(":")[1]
                                        ? form.state.values.tokenOut.split(
                                            ":"
                                          )[1]
                                        : "Select token"}
                                    </span>
                                  )}
                                </form.Subscribe>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] rounded-none border-primary">
                              <DialogHeader>
                                <DialogTitle>Select a token</DialogTitle>
                                <DialogDescription>
                                  Search and select a token to receive
                                </DialogDescription>
                              </DialogHeader>
                              {tokenOutList.map((token) => (
                                <button
                                  key={`${token.chain}:${token.address}`}
                                  className="flex flex-col gap-2 hover:cursor-pointer hover:bg-primary hover:text-secondary w-full text-left p-2"
                                  onClick={() => {
                                    form.setFieldValue(
                                      "tokenOut",
                                      `${token.address}:${token.symbol}:${token.decimals}`
                                    );
                                    // Clear tokenIn if it's the same as the selected tokenOut
                                    if (
                                      form.state.values.tokenIn &&
                                      form.state.values.tokenIn.split(
                                        ":"
                                      )[0] === token.address
                                    ) {
                                      form.setFieldValue(
                                        "tokenIn",
                                        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE:ETH:18"
                                      );
                                    }
                                    setTokenOutDialogOpen(false);
                                  }}
                                >
                                  <p>{token.name}</p>
                                  <div className="flex flex-row gap-2 items-center">
                                    <p>{token.symbol}</p>
                                    <p className="text-muted-foreground">
                                      {token.address.slice(0, 6)}...
                                      {token.address.slice(-4)}
                                    </p>
                                  </div>
                                </button>
                              ))}
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button
                                    className="rounded-none hover:cursor-pointer"
                                    variant="outline"
                                  >
                                    Cancel
                                  </Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <FieldInfo field={field} />
                      </div>
                    )}
                  </form.Field>
                </div>
              </TabsContent>
              <TabsContent value="buy" className="flex flex-col gap-4">
                <div>
                  {/* A type-safe field component*/}
                  <form.Field
                    name="amountOut"
                    validators={{
                      onChange: ({ value }) =>
                        !value
                          ? "Please enter an amount to swap"
                          : parseEther(value) < 0
                          ? "Amount must be greater than 0"
                          : undefined,
                    }}
                  >
                    {(field) => (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-row gap-2 items-center justify-between">
                          <p className="text-muted-foreground">You buy</p>
                          <div className="flex flex-row gap-4">
                            <button className="hover:cursor-pointer underline underline-offset-4">
                              25%
                            </button>
                            <button className="hover:cursor-pointer underline underline-offset-4">
                              50%
                            </button>
                            <button className="hover:cursor-pointer underline underline-offset-4">
                              75%
                            </button>
                            <button className="hover:cursor-pointer underline underline-offset-4">
                              Max
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-row gap-2 my-4">
                          {isDesktop ? (
                            <input
                              id={field.name}
                              name={field.name}
                              value={field.state.value || ""}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              className="bg-transparent text-4xl outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              type="number"
                              placeholder="0"
                              required
                            />
                          ) : (
                            <input
                              id={field.name}
                              name={field.name}
                              value={field.state.value || ""}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              className="bg-transparent text-4xl outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              type="number"
                              inputMode="decimal"
                              pattern="[0-9]*"
                              placeholder="0"
                              required
                            />
                          )}
                        </div>
                        <FieldInfo field={field} />
                      </div>
                    )}
                  </form.Field>
                </div>
                <div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2 items-center justify-between">
                      <p className="text-muted-foreground">You need</p>
                    </div>
                    <div className="flex flex-row gap-2 my-4">
                      {isDesktop ? (
                        <input
                          id="buyFormAmountIn"
                          name="buyFormAmountIn"
                          value=""
                          className="bg-transparent text-4xl outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          type="number"
                          placeholder="0"
                          readOnly
                        />
                      ) : (
                        <input
                          id="buyFormAmountIn"
                          name="buyFormAmountIn"
                          value=""
                          className="bg-transparent text-4xl outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          type="number"
                          inputMode="decimal"
                          pattern="[0-9]*"
                          placeholder="0"
                          readOnly
                        />
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <div>
              {/* A type-safe field component*/}
              <form.Field
                name="slippage"
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? "Please enter an amount to swap"
                      : parseEther(value) < 0
                      ? "Amount must be greater than 0"
                      : undefined,
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2 items-center justify-between">
                      <p className="text-muted-foreground">Slippage %</p>
                    </div>
                    <div className="flex flex-row gap-4">
                      {isDesktop ? (
                        <input
                          id={field.name}
                          name={field.name}
                          value={field.state.value || ""}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="bg-transparent text-sm outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          type="number"
                          placeholder="0"
                        />
                      ) : (
                        <input
                          id={field.name}
                          name={field.name}
                          value={field.state.value || ""}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="bg-transparent text-sm outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          type="number"
                          inputMode="decimal"
                          pattern="[0-9]*"
                          placeholder="0"
                        />
                      )}
                      <button
                        className="hover:cursor-pointer underline underline-offset-4"
                        onClick={() => field.handleChange("0.02")}
                      >
                        0.02%
                      </button>
                      <button
                        className="hover:cursor-pointer underline underline-offset-4"
                        onClick={() => field.handleChange("0.1")}
                      >
                        0.1%
                      </button>
                      <button
                        className="hover:cursor-pointer underline underline-offset-4"
                        onClick={() => field.handleChange("0.5")}
                      >
                        0.5%
                      </button>
                      <button
                        className="hover:cursor-pointer underline underline-offset-4"
                        onClick={() => field.handleChange("1")}
                      >
                        1%
                      </button>
                    </div>
                  </div>
                )}
              </form.Field>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground">Approve</p>
              <div className="grid grid-cols-2 gap-2">
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      size="lg"
                      variant="outline"
                      className="hover:cursor-pointer font-bold rounded-none text-sm"
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Please confirm in wallet
                        </>
                      ) : (
                        <>Unlimited</>
                      )}
                    </Button>
                  )}
                </form.Subscribe>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      size="lg"
                      className="hover:cursor-pointer font-bold rounded-none text-sm"
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Please confirm in wallet
                        </>
                      ) : (
                        <>Exact amount</>
                      )}
                    </Button>
                  )}
                </form.Subscribe>
              </div>

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    size="lg"
                    className="hover:cursor-pointer text-lg font-bold rounded-none"
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Please confirm in wallet
                      </>
                    ) : (
                      <>Swap</>
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </div>
        </form>
      </div>
      <div className="grid grid-rows-2 gap-4 h-full">
        <SwapSourceComponent
          chainName={form.state.values.chain}
          tokenIn={form.state.values.tokenIn}
          tokenOut={form.state.values.tokenOut}
          amountIn={form.state.values.amountIn}
          amountOut={form.state.values.amountOut}
          setAmountOut={(value: string) => form.setFieldValue("amountOut", value)}
        />
        <TransactionStatusComponent />
      </div>
    </>
  );
}

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {!field.state.meta.isTouched ? (
        <em>Please enter an amount to swap</em>
      ) : field.state.meta.isTouched && !field.state.meta.isValid ? (
        <em
          className={`${
            field.state.meta.errors.join(",") ===
            "Please enter an amount to swap"
              ? ""
              : "text-red-400"
          }`}
        >
          {field.state.meta.errors.join(",")}
        </em>
      ) : (
        <em className="text-green-500">ok!</em>
      )}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
}
