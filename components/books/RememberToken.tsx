"use client";

import { useEffect } from "react";
import { rememberReadToken } from "./EmailGate";

/**
 * Persists the read token the moment a subscription is confirmed.
 *
 * Its own client component so the confirm page stays server-rendered — and so
 * the "you already have this book" state on every other book page has something
 * to read. Without it a confirmed reader is shown the signup form again on the
 * next page they open, which reads as the site forgetting them.
 */
export default function RememberToken({ token }: { token: string }) {
  useEffect(() => {
    if (token) rememberReadToken(token);
  }, [token]);
  return null;
}
