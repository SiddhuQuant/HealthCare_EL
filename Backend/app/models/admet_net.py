"""
ADMETNet — EXACT architecture used during Colab training
"""

import torch
import torch.nn as nn


class ADMETNet(nn.Module):

    def __init__(self, input_dim=2048, dropout=0.3):

        super().__init__()

        self.shared = nn.Sequential(

            nn.Linear(input_dim, 1024),
            nn.ReLU(),
            nn.Dropout(dropout),

            nn.Linear(1024, 512),
            nn.ReLU(),
            nn.Dropout(dropout),

            nn.Linear(512, 256),
            nn.ReLU()
        )

        # Regression heads
        self.esol_head = nn.Linear(256, 1)

        self.lipo_head = nn.Linear(256, 1)

        # Classification heads
        self.bbbp_head = nn.Sequential(
            nn.Linear(256, 1),
            nn.Sigmoid()
        )

        self.tox21_head = nn.Sequential(
            nn.Linear(256, 1),
            nn.Sigmoid()
        )

    def forward(self, x):

        shared = self.shared(x)

        return {

            "esol": self.esol_head(shared),

            "lipo": self.lipo_head(shared),

            "bbbp": self.bbbp_head(shared),

            "tox21": self.tox21_head(shared)
        }