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
import {
  useChainId,
  useSwitchChain,
  useReadContract,
  useAccount,
  useBalance,
} from "wagmi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BuildSkeleton } from "@/components/build-ui/build-skeleton";
import { parseEther, parseUnits, erc20Abi, formatUnits, Address } from "viem";
import { Button } from "@/components/ui/button";
import { Loader2, OctagonAlert, X } from "lucide-react";
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
import { chainList, type ChainIdentifier } from "@/lib/chainList";

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
    reset: resetSwitchChain,
  } = useSwitchChain();

  // hook to get account
  const { address, isConnected } = useAccount();

  // get native balance if tokenIn of tokenOut is selected
  const { data: nativeBalance, isLoading: isLoadingNativeBalance } = useBalance(
    {
      address: address,
      chainId: chainId,
      query: {
        enabled: !!address,
      },
    }
  );
  // form to handle the swap
  const form = useForm({
    // default values for the form
    defaultValues: {
      amountIn: "",
      amountOut: "",
      chain: "",
      tokenIn: "",
      tokenOut: "",
      slippage: "0",
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

  // open and close state for chainDialog
  const [chainDialogOpen, setChainDialogOpen] = useState(false);

  // open and close state for tokenInDialog
  const [tokenInDialogOpen, setTokenInDialogOpen] = useState(false);

  // open and close state for tokenOutDialog
  const [tokenOutDialogOpen, setTokenOutDialogOpen] = useState(false);

  // hook to get tokenIn balance
  const { data: tokenInBalance, isLoading: isLoadingTokenInBalance } =
    useReadContract({
      address: form.state.values.tokenIn.split(":")[0] as Address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address as Address],
      query: {
        enabled:
          !!form.state.values.tokenIn &&
          form.state.values.tokenIn.split(":")[0] !==
            "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      },
    });

  // hook to get tokenOut balance
  const { data: tokenOutBalance, isLoading: isLoadingTokenOutBalance } =
    useReadContract({
      address: form.state.values.tokenOut.split(":")[0] as Address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address as Address],
      query: {
        enabled:
          !!form.state.values.tokenOut &&
          form.state.values.tokenOut.split(":")[0] !==
            "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      },
    });

  // Get all tokens for the current chain and memoize them
  const chainAllTokens = useMemo(
    () => tokenList.filter((token) => token.chainId === chainId),
    [chainId]
  );

  // tokenInList excludes only the selected tokenOut
  const tokenInList = useMemo(
    () =>
      chainAllTokens.filter((token) => {
        const isNotSelectedTokenOut =
          !form.state.values.tokenOut ||
          token.address !== form.state.values.tokenOut.split(":")[0];
        return isNotSelectedTokenOut;
      }),
    [chainAllTokens, form.state.values.tokenOut]
  );

  // tokenOutList excludes only the selected tokenIn
  const tokenOutList = useMemo(
    () =>
      chainAllTokens.filter((token) => {
        const isNotSelectedTokenIn =
          !form.state.values.tokenIn ||
          token.address !== form.state.values.tokenIn.split(":")[0];
        return isNotSelectedTokenIn;
      }),
    [chainAllTokens, form.state.values.tokenIn]
  );

  // render
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
              {!isConnected && (
                <div className="flex flex-row gap-2 items-center bg-blue-500 p-2 text-white w-full">
                  <OctagonAlert className="w-4 h-4" />
                  <p className="text-sm font-bold">
                    Please connect your wallet to continue.
                  </p>
                </div>
              )}
              {isSwitchChainError && (
                <div className="flex flex-row justify-between items-center bg-red-500 p-2 text-white w-full">
                  <div className="flex flex-row gap-2 items-center">
                    <OctagonAlert className="w-4 h-4" />
                    <p className="text-sm font-bold">
                      Failed to switch chain. Try again.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="rounded-none hover:cursor-pointer"
                    onClick={() => resetSwitchChain()}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              {/* <form.Field
                name="chain"
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? "Please select a chain"
                      : !chainList.includes(value)
                      ? "Invalid chain"
                      : undefined,
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <Select
                      onValueChange={(value) => {
                        switchChain(
                          { chainId: parseInt(value.split(":")[0]) },
                          {
                            onSuccess: () => {
                              field.handleChange(value);
                            },
                          }
                        );
                      }}
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
                    <SelectFieldInfo field={field} />
                  </div>
                )}
              </form.Field> */}
              <form.Field
                name="chain"
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? "Please select a chain"
                      : !chainList.includes(value as ChainIdentifier)
                      ? "Invalid chain"
                      : undefined,
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <Dialog
                      open={chainDialogOpen}
                      onOpenChange={setChainDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="rounded-none hover:cursor-pointer"
                        >
                          <form.Subscribe
                            selector={(state) => [state.values.chain]}
                          >
                            {(
                              chain // eslint-disable-line @typescript-eslint/no-unused-vars
                            ) => (
                              <div className="flex flex-row gap-2 items-center">
                                {form.state.values.chain.split(":")[2]
                                  ? form.state.values.chain.split(":")[2]
                                  : "Select chain"}
                                {isSwitchChainPending && (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                              </div>
                            )}
                          </form.Subscribe>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] rounded-none border-primary">
                        <DialogHeader>
                          <DialogTitle>Select a chain</DialogTitle>
                          <DialogDescription>
                            Search and select a chain to swap on
                          </DialogDescription>
                        </DialogHeader>
                        {chainList.map((chain) => (
                          <button
                            key={chain}
                            className="flex flex-col gap-2 hover:cursor-pointer hover:bg-primary hover:text-secondary w-full text-left p-2"
                            onClick={() => {
                              switchChain(
                                { chainId: parseInt(chain.split(":")[0]) },
                                {
                                  onSuccess: () => {
                                    field.handleChange(chain);
                                    setChainDialogOpen(false);
                                  },
                                }
                              );
                            }}
                          >
                            <p>{chain.split(":")[2]}</p>
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
                    <SelectFieldInfo field={field} />
                  </div>
                )}
              </form.Field>
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
                          : parseUnits(
                              value,
                              parseInt(form.state.values.tokenIn.split(":")[2])
                            ) < 0
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
                        <div className="flex flex-row items-center justify-between">
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
                                      {form.state.values.tokenIn.split(":")[1]
                                        ? form.state.values.tokenIn.split(
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
                        <div className="flex flex-row gap-2 items-center">
                          {isLoadingTokenInBalance || isLoadingNativeBalance ? (
                            <BuildSkeleton className="w-8 h-3" />
                          ) : form.state.values.tokenIn.split(":")[0] ===
                              "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" &&
                            nativeBalance ? (
                            <div className="text-sm text-muted-foreground">
                              {formatUnits(nativeBalance.value, 18)}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              {formatUnits(
                                tokenInBalance ?? BigInt(0),
                                parseInt(
                                  form.state.values.tokenIn.split(":")[2]
                                )
                              )}
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground">
                            {form.state.values.tokenIn.split(":")[1]
                              ? form.state.values.tokenIn.split(":")[1]
                              : "--"}
                          </div>
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
                        <div className="flex flex-row items-center justify-between">
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
                        <div className="flex flex-row gap-2 items-center">
                          {isLoadingTokenOutBalance ? (
                            <BuildSkeleton className="w-8 h-3" />
                          ) : form.state.values.tokenOut.split(":")[0] ===
                              "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" &&
                            nativeBalance ? (
                            <div className="text-sm text-muted-foreground">
                              {formatUnits(nativeBalance.value, 18)}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              {formatUnits(
                                tokenOutBalance ?? BigInt(0),
                                parseInt(
                                  form.state.values.tokenOut.split(":")[2]
                                )
                              )}
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground">
                            {form.state.values.tokenOut.split(":")[1]
                              ? form.state.values.tokenOut.split(":")[1]
                              : "--"}
                          </div>
                        </div>
                        <TokenOutFieldInfo field={field} />
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
                        <div className="flex flex-row gap-2">
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
                    <div className="flex flex-row gap-2">
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
                      : value !== "999" && parseFloat(value) < 0
                      ? "Amount must be greater than 0"
                      : undefined,
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2 items-center justify-between">
                      <p className="text-muted-foreground">Slippage</p>
                      <div className="flex flex-row gap-2">
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
                        <button
                          className="hover:cursor-pointer underline underline-offset-4"
                          onClick={() => field.handleChange("0")}
                        >
                          Auto
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-row items-center justify-between">
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
                      <div>
                        {field.state.value === "0" ? (
                          <p className="text-muted-foreground">Auto</p>
                        ) : (
                          <p className="text-muted-foreground">%</p>
                        )}
                      </div>
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
          setAmountOut={(value: string) =>
            form.setFieldValue("amountOut", value)
          }
        />
        <TransactionStatusComponent />
      </div>
    </>
  );
}

// field info for input field
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

function TokenOutFieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {!field.state.meta.isTouched ? (
        <em>Please select a token</em>
      ) : field.state.meta.isTouched && !field.state.meta.isValid ? (
        <em className="text-red-400">{field.state.meta.errors.join(",")}</em>
      ) : (
        <em className="text-green-500">ok!</em>
      )}
    </>
  );
}

// field info for select field
function SelectFieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {!field.state.meta.isTouched ? (
        <em>Please select a chain</em>
      ) : field.state.meta.isTouched && !field.state.meta.isValid ? (
        <em className="text-red-400">{field.state.meta.errors.join(",")}</em>
      ) : (
        <em className="text-green-500">ok!</em>
      )}
    </>
  );
}
