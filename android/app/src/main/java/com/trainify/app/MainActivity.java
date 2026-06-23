package com.trainify.app;

import android.os.Bundle;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.ActionBar;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // IMPORTANTE: chamar EdgeToEdge.enable() DEPOIS de super.onCreate().
        // Se chamado antes, a Window é criada com o tema default (que tem ActionBar),
        // gerando a faixa preta com "Trainify" no topo.
        // Necessário para o plugin @capacitor-community/safe-area expor os insets
        // reais (status bar e navigation bar) ao WebView via env().
        EdgeToEdge.enable(this);

        // Defesa extra: esconde qualquer ActionBar nativa que tenha sido inflada.
        ActionBar actionBar = getSupportActionBar();
        if (actionBar != null) {
            actionBar.hide();
        }
    }
}
