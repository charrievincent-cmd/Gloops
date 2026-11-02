"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Fait fermer une fenêtre (modale, fiche…) par la touche « retour » du téléphone
 * au lieu de quitter l'application.
 *
 * À l'ouverture, on ajoute une entrée dans l'historique du navigateur : la touche
 * retour retire cette entrée (événement `popstate`) et on ferme la fenêtre.
 * Le bouton de fermeture doit appeler la fonction renvoyée par ce hook pour que
 * l'historique reste propre. Si la fenêtre est fermée autrement (suppression,
 * bouteille bue…), l'entrée ajoutée est retirée automatiquement.
 */
export function useCloseOnBack(onClose: () => void) {
  const onCloseRef = useRef(onClose);
  const pushedRef = useRef(false);
  const cleanupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    // En développement, React monte/démonte/remonte : on annule le retrait prévu.
    if (cleanupTimer.current) {
      clearTimeout(cleanupTimer.current);
      cleanupTimer.current = null;
    }
    if (!pushedRef.current) {
      window.history.pushState({ ...window.history.state, gloopsModal: true }, "");
      pushedRef.current = true;
    }

    const onPop = () => {
      if (!pushedRef.current) return;
      pushedRef.current = false;
      onCloseRef.current();
    };
    window.addEventListener("popstate", onPop);

    return () => {
      window.removeEventListener("popstate", onPop);
      cleanupTimer.current = setTimeout(() => {
        // Fenêtre fermée sans passer par la touche retour : on retire l'entrée ajoutée.
        if (pushedRef.current) {
          pushedRef.current = false;
          window.history.back();
        }
      }, 0);
    };
  }, []);

  return useCallback(() => {
    if (pushedRef.current) {
      window.history.back(); // déclenche popstate → onClose
    } else {
      onCloseRef.current();
    }
  }, []);
}
