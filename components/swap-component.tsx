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
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";

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
          <div>
            {/* A type-safe field component*/}
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
                    <p className="text-muted-foreground">Sell</p>
                    <button className="bg-transparent border border-muted-foreground text-muted-foreground rounded-md px-2 py-0.5 hover:cursor-pointer">
                      Max
                    </button>
                  </div>
                  <div className="flex flex-row gap-2">
                    {isDesktop ? (
                      <input
                        id={field.name}
                        name={field.name}
                        value={field.state.value || ""}
                        onChange={(e) => field.handleChange(e.target.value)}
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
                        onChange={(e) => field.handleChange(e.target.value)}
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
                    <p className="text-muted-foreground">Buy</p>
                    <button className="bg-transparent border border-muted-foreground text-muted-foreground rounded-md px-2 py-0.5 hover:cursor-pointer">
                      Max
                    </button>
                  </div>
                  <div className="flex flex-row gap-2">
                    {isDesktop ? (
                      <input
                        id={field.name}
                        name={field.name}
                        value={field.state.value || ""}
                        onChange={(e) => field.handleChange(e.target.value)}
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
                        onChange={(e) => field.handleChange(e.target.value)}
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
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                size="lg"
                className="hover:cursor-pointer text-lg font-bold rounded-none"
                type="submit"
                disabled={
                  !canSubmit ||
                  isSubmitting
                }
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
