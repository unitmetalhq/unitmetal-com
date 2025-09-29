"use client";

import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatUnits, parseUnits, parseEther } from "viem";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Settings,
  ChevronDown,
  ChevronsUpDown,
  RefreshCcw,
  Coins,
  Quote,
  Loader2,
} from "lucide-react";
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

export default function SwapComponent() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const form = useForm({
    defaultValues: {
      amountIn: "",
      amountOut: "",
      chain: "ethereum",
      tokenIn: "eth",
      tokenOut: "usdc",
    },
    onSubmit: async ({ value }) => {
      console.log(value);
    },
  });

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
              <Label htmlFor="select-chain">Chain</Label>
              <Select>
                <SelectTrigger className="w-full border-primary border-1 rounded-none">
                  <SelectValue placeholder="Select a chain" />
                </SelectTrigger>
                <SelectContent className="border-primary border-1 rounded-none">
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="base">Base</SelectItem>
                  <SelectItem value="arbitrum">Arbitrum</SelectItem>
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
                          ? "Please enter an amount to mint"
                          : parseEther(value) < 0
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
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="rounded-none"
                              >
                                ETH
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Select a token</DialogTitle>
                                <DialogDescription>
                                  Search and select a token to sell
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4">
                                <div className="grid gap-3">
                                  <Label htmlFor="name-1">Name</Label>
                                </div>
                                <div className="grid gap-3">
                                  <Label htmlFor="username-1">Username</Label>
                                </div>
                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit">Save changes</Button>
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
                  {/* Output for sell form */}
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2 items-center justify-between">
                      <p className="text-muted-foreground">You receive</p>
                    </div>
                    <div className="flex flex-row items-center justify-between my-4">
                      {isDesktop ? (
                        <input
                          id="sellFormAmountOut"
                          name="sellFormAmountOut"
                          value=""
                          className="bg-transparent text-4xl outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          type="number"
                          placeholder="0"
                          readOnly
                        />
                      ) : (
                        <input
                          id="sellFormAmountOut"
                          name="sellFormAmountOut"
                          value=""
                          className="bg-transparent text-4xl outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          type="number"
                          inputMode="decimal"
                          pattern="[0-9]*"
                          placeholder="0"
                          readOnly
                        />
                      )}
                      <Button variant="outline" className="rounded-none">
                        USDC
                      </Button>
                    </div>
                  </div>
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
                          ? "Please enter an amount to mint"
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
        </form>
      </div>
      <div className="grid grid-rows-2 gap-4 h-full">
        <SwapSourceComponent />
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
