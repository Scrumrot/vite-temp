import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import PeopleIcon from '@mui/icons-material/People'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import InventoryIcon from '@mui/icons-material/Inventory'
import { green, red } from '@mui/material/colors'

interface StatCardProps {
  title: string
  value: string
  change: number
  icon: React.ReactNode
  color: string
}

function StatCard({ title, value, change, icon, color }: StatCardProps) {
  const isPositive = change >= 0
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="text.secondary" variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ my: 1 }}>
              {value}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {isPositive ? (
                <TrendingUpIcon sx={{ color: green[500], fontSize: 20 }} />
              ) : (
                <TrendingDownIcon sx={{ color: red[500], fontSize: 20 }} />
              )}
              <Typography
                variant="body2"
                sx={{ color: isPositive ? green[500] : red[500] }}
              >
                {isPositive ? '+' : ''}{change}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                vs last month
              </Typography>
            </Box>
          </Box>
          <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  )
}

const recentActivity = [
  { id: 1, user: 'John Doe', action: 'placed an order', time: '5 minutes ago' },
  { id: 2, user: 'Jane Smith', action: 'left a review', time: '12 minutes ago' },
  { id: 3, user: 'Bob Johnson', action: 'updated profile', time: '1 hour ago' },
  { id: 4, user: 'Alice Brown', action: 'subscribed to newsletter', time: '2 hours ago' },
]

const tasks = [
  { id: 1, name: 'Review pending orders', progress: 75 },
  { id: 2, name: 'Update inventory', progress: 40 },
  { id: 3, name: 'Customer feedback analysis', progress: 90 },
  { id: 4, name: 'Monthly report', progress: 20 },
]

export default function DashboardShowcase() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Dashboard Stats
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total Users"
              value="24,521"
              change={12.5}
              icon={<PeopleIcon />}
              color="primary.main"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Orders"
              value="1,432"
              change={-3.2}
              icon={<ShoppingCartIcon />}
              color="secondary.main"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Revenue"
              value="$48,290"
              change={8.1}
              icon={<AttachMoneyIcon />}
              color="success.main"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Products"
              value="892"
              change={2.4}
              icon={<InventoryIcon />}
              color="warning.main"
            />
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List dense>
                {recentActivity.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                        {item.user.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2">
                          <strong>{item.user}</strong> {item.action}
                        </Typography>
                      }
                      secondary={item.time}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Task Progress
              </Typography>
              <Stack spacing={2}>
                {tasks.map((task) => (
                  <Box key={task.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{task.name}</Typography>
                      <Chip
                        label={`${task.progress}%`}
                        size="small"
                        color={task.progress >= 75 ? 'success' : task.progress >= 50 ? 'warning' : 'default'}
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={task.progress}
                      sx={{ height: 6, borderRadius: 1 }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  )
}
