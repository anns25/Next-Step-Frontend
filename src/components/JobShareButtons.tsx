"use client";

import React from 'react';
import { Box, IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import {
    Share as ShareIcon,
    Facebook as FacebookIcon,
    Twitter as TwitterIcon,
    LinkedIn as LinkedInIcon,
    ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { Job } from '@/types/Job';

interface JobShareButtonsProps {
    job: Job;
    variant?: 'inline' | 'menu';
}

export default function JobShareButtons({ job, variant = 'menu' }: JobShareButtonsProps) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [copySuccess, setCopySuccess] = React.useState(false);

    const jobUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/user/jobs/${job._id}`
        : '';

    const jobTitle = `${job.title} at ${typeof job.company === 'string' ? job.company : job.company.name}`;
    const jobDescription = job.description.substring(0, 200);

    const shareUrls = {
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(jobUrl)}&text=${encodeURIComponent(jobTitle)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}`,
    };

    const handleShare = (platform: string) => {
        const url = shareUrls[platform as keyof typeof shareUrls];
        window.open(url, '_blank', 'width=600,height=400');
        setAnchorEl(null);
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(jobUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
        setAnchorEl(null);
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: jobTitle,
                    text: jobDescription,
                    url: jobUrl,
                });
                setAnchorEl(null);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        }
    };

    // Inline variant - show ShareThis buttons
    if (variant === 'inline') {
        return (
            <Box sx={{ my: 2 }}>
                <div
                    className="sharethis-inline-share-buttons"
                    data-url={jobUrl}
                    data-title={jobTitle}
                    data-description={jobDescription}
                ></div>
            </Box>
        );
    }

    // Menu variant - custom share menu
    return (
        <>
            <Tooltip title={copySuccess ? "Link copied!" : "Share job"}>
                <IconButton
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    size="small"
                    color="primary"
                >
                    <ShareIcon />
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={() => handleShare('linkedin')}>
                    <ListItemIcon>
                        <LinkedInIcon fontSize="small" sx={{ color: '#0077B5' }} />
                    </ListItemIcon>
                    <ListItemText>Share on LinkedIn</ListItemText>
                </MenuItem>

                <MenuItem onClick={() => handleShare('twitter')}>
                    <ListItemIcon>
                        <TwitterIcon fontSize="small" sx={{ color: '#1DA1F2' }} />
                    </ListItemIcon>
                    <ListItemText>Share on Twitter</ListItemText>
                </MenuItem>

                <MenuItem onClick={() => handleShare('facebook')}>
                    <ListItemIcon>
                        <FacebookIcon fontSize="small" sx={{ color: '#1877F2' }} />
                    </ListItemIcon>
                    <ListItemText>Share on Facebook</ListItemText>
                </MenuItem>

                <MenuItem onClick={handleCopyLink}>
                    <ListItemIcon>
                        <CopyIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Copy Link</ListItemText>
                </MenuItem>

                {'share' in navigator && (
                    <MenuItem onClick={handleNativeShare}>
                        <ListItemIcon>
                            <ShareIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>More Options</ListItemText>
                    </MenuItem>
                )}
            </Menu>
        </>
    );
}