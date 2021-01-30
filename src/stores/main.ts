import { writable } from "svelte/store";
import type { View } from "../helpers/View";

export const isInspectStore = writable<boolean>(false);


